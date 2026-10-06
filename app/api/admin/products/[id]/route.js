import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(message, status, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

function dbError(err, fallback) {
  const code = err?.code ?? err?.cause?.code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return errorResponse("Cannot reach the database. Try again later.", 503);
  }
  return errorResponse(fallback, 500);
}

// Change the product photo
export async function PATCH(request, { params }) {
  // Admin access is enforced by middleware.js (/api/admin/*)
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return errorResponse("Invalid product id.", 400);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!imageUrl) {
    return errorResponse("Please fix the highlighted fields.", 422, {
      imageUrl: "Product image is required.",
    });
  }
  try {
    if (new URL(imageUrl).protocol !== "https:") {
      return errorResponse("Image URL must use https.", 422, {
        imageUrl: "Image URL must use https.",
      });
    }
  } catch {
    return errorResponse("Image URL is not a valid URL.", 422, {
      imageUrl: "Image URL is not a valid URL.",
    });
  }

  try {
    const [updated] = await db
      .update(products)
      .set({ imageUrl, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning({ id: products.id, imageUrl: products.imageUrl });

    if (!updated) return errorResponse("This product no longer exists.", 404);

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);

    return NextResponse.json({
      success: true,
      message: "Photo updated.",
      product: updated,
    });
  } catch (err) {
    console.error("products PATCH error:", err);
    return dbError(err, "Something went wrong while updating the photo.");
  }
}

// Delete the product
export async function DELETE(_request, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return errorResponse("Invalid product id.", 400);
  }

  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    if (!deleted) return errorResponse("This product no longer exists.", 404);

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ success: true, message: "Product deleted." });
  } catch (err) {
    console.error("products DELETE error:", err);
    return dbError(err, "Something went wrong while deleting the product.");
  }
}