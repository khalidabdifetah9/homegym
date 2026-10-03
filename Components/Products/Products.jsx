import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";
import ProductsView from "./ProductsView";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      imageUrl: products.imageUrl,
      categoryId: productCategories.id,
      categoryName: productCategories.name,
      categoryDescription: productCategories.description,
    })
    .from(products)
    .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
    .orderBy(asc(productCategories.createdAt), desc(products.createdAt));

  // Group products under their category, keeping the category order
  const map = new Map();
  for (const row of rows) {
    if (!row.imageUrl) continue;

    if (!map.has(row.categoryId)) {
      map.set(row.categoryId, {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        products: [],
      });
    }
    map.get(row.categoryId).products.push({
      id: row.id,
      imageUrl: row.imageUrl,
    });
  }

  return <ProductsView categories={[...map.values()]} />;
}