import { NextResponse } from "next/server";
import crypto from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, qrCodes } from "@/db/schema";

export const dynamic = "force-dynamic";

const MAX_PER_BATCH = 500;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 32 characters, no 0/O/1/I so printed serials are easy to read
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

function randomChars(length) {
  const bytes = crypto.randomBytes(length);
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

// Example: WNDA-K7M2P-9XQ4T
function randomCode() {
  const s = randomChars(10);
  return `WNDA-${s.slice(0, 5)}-${s.slice(5)}`;
}

// Example: B20261003-A7K3
function makeBatchNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `B${date}-${randomChars(4)}`;
}

// Product types for the dropdown
export async function GET() {
  // TODO: protect this route (check admin session here)
  try {
    const categories = await db
      .select({ id: productCategories.id, name: productCategories.name })
      .from(productCategories)
      .orderBy(asc(productCategories.name));

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("generate_qr GET error:", err);
    return errorResponse("Could not load product types.", 500);
  }
}

export async function POST(request) {
  // TODO: protect this route (check admin session here)

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { count, categoryId } = body ?? {};
  const errors = {};

  if (!Number.isInteger(count) || count < 1) {
    errors.count = "Enter a whole number of 1 or more.";
  } else if (count > MAX_PER_BATCH) {
    errors.count = `You can generate at most ${MAX_PER_BATCH} codes at a time.`;
  }

  if (typeof categoryId !== "string" || !UUID_REGEX.test(categoryId)) {
    errors.categoryId = "Please select a product type.";
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  try {
    const [category] = await db
      .select({ id: productCategories.id, name: productCategories.name })
      .from(productCategories)
      .where(eq(productCategories.id, categoryId))
      .limit(1);

    if (!category) {
      return errorResponse("The selected product type does not exist.", 404, {
        categoryId: "The selected product type does not exist.",
      });
    }

    const batchNumber = makeBatchNumber();
    const saved = [];
    let attempts = 0;

    // Duplicates are practically impossible, but if one happens
    // the unique constraint skips it and we top up the missing ones.
    while (saved.length < count && attempts < 5) {
      attempts++;
      const needed = count - saved.length;

      const batch = new Set();
      while (batch.size < needed) batch.add(randomCode());

      const rows = await db
        .insert(qrCodes)
        .values([...batch].map((code) => ({ code, categoryId, batchNumber })))
        .onConflictDoNothing()
        .returning({ code: qrCodes.code });

      saved.push(...rows.map((r) => r.code));
    }

    if (saved.length < count) {
      return errorResponse(
        "Could not generate enough unique codes. Please try again.",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${count} QR ${count === 1 ? "code" : "codes"} generated.`,
        batchNumber,
        categoryName: category.name,
        codes: saved,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("generate_qr POST error:", err);

    const code = err?.code ?? err?.cause?.code;

    if (code === "23503") {
      return errorResponse("The selected product type no longer exists.", 404);
    }
    if (code === "42703" || code === "42P01") {
      return errorResponse(
        "Database tables are out of date. Run your migration (drizzle-kit push).",
        500
      );
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong while generating the codes.", 500);
  }
}