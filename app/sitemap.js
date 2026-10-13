import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.wendawend-homegym.com"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap() {
  let productRows = [];

  try {
    productRows = await db
      .select({ id: products.id, updatedAt: products.updatedAt })
      .from(products)
      .orderBy(desc(products.updatedAt));
  } catch (err) {
    console.error("sitemap: could not load products", err);
  }

  const latestProductChange = productRows[0]?.updatedAt ?? new Date();

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: latestProductChange,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: latestProductChange,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/register`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const productPages = productRows.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}