import { NextResponse } from "next/server";
import { db } from "@/db"; // adjust to where your drizzle instance lives
import { products } from "@/db/schema"; // adjust to where your schema lives

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

function validate({ title, description, imageUrl }) {
  const errors = {};

  if (typeof title !== "string" || !title.trim()) {
    errors.title = "Product name is required.";
  } else if (title.trim().length > 200) {
    errors.title = "Product name must be 200 characters or less.";
  }

  if (typeof description !== "string" || !description.trim()) {
    errors.description = "Description is required.";
  } else if (description.trim().length > 5000) {
    errors.description = "Description must be 5000 characters or less.";
  }

  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    errors.imageUrl = "Product image is required.";
  } else {
    try {
      const url = new URL(imageUrl);
      if (url.protocol !== "https:") {
        errors.imageUrl = "Image URL must use https.";
      }
    } catch {
      errors.imageUrl = "Image URL is not a valid URL.";
    }
  }

  return errors;
}

export async function POST(request) {
  // TODO: protect this route (check admin session/token here)
  // if (!isAdmin) return errorResponse("Unauthorized.", 401);

  // 1. Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  // 2. Validate
  const errors = validate(body ?? {});
  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  // 3. Save to database
  try {
    const [product] = await db
      .insert(products)
      .values({
        name: body.title.trim(),
        description: body.description.trim(),
        imageUrl: body.imageUrl.trim(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Product posted successfully!",
        product,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("post_product error:", err);

    // Postgres error code may be on err or err.cause (newer drizzle wraps it)
    const code = err?.code ?? err?.cause?.code;

    if (code === "23505") {
      return errorResponse("A product with this SKU already exists.", 409);
    }
    if (code === "23502") {
      return errorResponse("A required field is missing.", 400);
    }
    if (code === "22001") {
      return errorResponse("One of the values is too long.", 400);
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong while saving the product.", 500);
  }
}