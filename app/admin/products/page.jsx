import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";
import AdminProducts from "@/Components/Admin/AdminProducts";

export const metadata = {
  title: "Product Catalog | ወንዳወንድ Home Gym",
  description:
    "View, edit, and manage your equipment models, specifications, and media assets",
  other: { "color-scheme": "only light" },
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select({
      categoryId: productCategories.id,
      categoryName: productCategories.name,
      categoryDescription: productCategories.description,
      productId: products.id,
      imageUrl: products.imageUrl,
    })
    .from(productCategories)
    .leftJoin(products, eq(products.categoryId, productCategories.id))
    .orderBy(asc(productCategories.createdAt), desc(products.createdAt));

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.categoryId)) {
      map.set(row.categoryId, {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        products: [],
      });
    }
    if (row.productId) {
      map.get(row.categoryId).products.push({
        id: row.productId,
        imageUrl: row.imageUrl,
      });
    }
  }

  return <AdminProducts initialCategories={[...map.values()]} />;
}
