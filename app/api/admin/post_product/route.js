import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status },
  );
}

function validate({ categoryId, imageUrl }) {
  const errors = {};

  if (typeof categoryId !== "string" || !UUID_REGEX.test(categoryId)) {
    errors.categoryId = "Please select a product type.";
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

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const errors = validate(body ?? {});
  if (Object.keys(errors).length > 0) {
    return errorResponse("Please fix the highlighted fields.", 422, errors);
  }

  const categoryId = body.categoryId;
  const imageUrl = body.imageUrl.trim();

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

    const [product] = await db
      .insert(products)
      .values({ categoryId, imageUrl })
      .returning();

    revalidatePath("/products");

    return NextResponse.json(
      {
        success: true,
        message: `Product added to ${category.name}.`,
        product,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("post_product error:", err);

    const code = err?.code ?? err?.cause?.code;

    if (code === "23503") {
      return errorResponse("The selected product type no longer exists.", 404, {
        categoryId: "The selected product type no longer exists.",
      });
    }
    if (code === "23502") {
      return errorResponse("A required field is missing.", 400);
    }
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return errorResponse("Cannot reach the database. Try again later.", 503);
    }

    return errorResponse("Something went wrong while saving the product.", 500);
  }
}
