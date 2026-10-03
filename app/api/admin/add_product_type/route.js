import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { productCategories } from "@/db/schema";

export const dynamic = "force-dynamic";

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status },
  );
}

export async function GET() {
  try {
    const categories = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        description: productCategories.description,
      })
      .from(productCategories)
      .orderBy(desc(productCategories.createdAt));

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("product_types GET error:", err);
    return errorResponse("Could not load product types.", 500);
  }
}

export async function POST(request) {

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { name, description } = body ?? {};
  const errors = {};

  if (typeof name !== "string" || !name.trim()) {
    errors.name = "Product type name is required.";
  } else if (name.trim().length > 100) {
    errors.name = "Name must be 100 characters or less.";
  }

  if (description != null && typeof description !== "string") {
    errors.description = "Description must be text.";
  } else if (description && description.trim().length > 1000) {
    errors.description = "Description must be 1000 characters or less.";
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  // 3. Save
  try {
    const [created] = await db
      .insert(productCategories)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Product type added.",
        category: created,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("product_types POST error:", err);

    const code = err?.code ?? err?.cause?.code;

    if (code === "23505") {
      return errorResponse(
        "A product type with this name already exists.",
        409,
        {
          name: "A product type with this name already exists.",
        },
      );
    }
    if (code === "42P01") {
      return errorResponse(
        "The product_categories table does not exist. Run your database migration.",
        500,
      );
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong while saving.", 500);
  }
}
