import { NextResponse } from "next/server";
import crypto from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db"; // same db import as your other routes
import { products, qrCodes } from "@/db/schema"; // same schema import

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

// Example: WNDA-K7M2P-9XQ4T
function randomCode() {
  const bytes = crypto.randomBytes(10);
  let s = "";
  for (let i = 0; i < 10; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `WNDA-${s.slice(0, 5)}-${s.slice(5)}`;
}

// Example: B20261002-A7K3
function makeBatchNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const bytes = crypto.randomBytes(4);
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `B${date}-${s}`;
}

// Products for the dropdown
export async function GET() {
  // TODO: protect this route (check admin session/token here)
  try {
    const rows = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .orderBy(asc(products.name));

    return NextResponse.json({ success: true, products: rows });
  } catch (err) {
    console.error("generate_qr GET error:", err);
    return errorResponse("Could not load products.", 500);
  }
}

export async function POST(request) {
  // TODO: protect this route (check admin session/token here)
  // if (!isAdmin) return errorResponse("Unauthorized.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { count, productId } = body ?? {};
  const errors = {};

  if (!Number.isInteger(count) || count < 1) {
    errors.count = "Enter a whole number of 1 or more.";
  } else if (count > MAX_PER_BATCH) {
    errors.count = `You can generate at most ${MAX_PER_BATCH} codes at a time.`;
  }

  if (typeof productId !== "string" || !UUID_REGEX.test(productId)) {
    errors.productId = "Please select a product.";
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  try {
    // Make sure the product exists
    const [product] = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return errorResponse("The selected product does not exist.", 404, {
        productId: "The selected product does not exist.",
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
        .values([...batch].map((code) => ({ code, productId, batchNumber })))
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
        productName: product.name,
        codes: saved,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("generate_qr POST error:", err);

    const code = err?.code ?? err?.cause?.code;

    if (code === "23503") {
      return errorResponse("The selected product no longer exists.", 404);
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong while generating the codes.", 500);
  }
}