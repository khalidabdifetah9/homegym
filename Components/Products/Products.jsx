import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import ProductsView from "./ProductsView";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .orderBy(desc(products.createdAt));

  const items = rows.filter((p) => p.imageUrl);

  return <ProductsView products={items} />;
}