
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/products`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const productPages: MetadataRoute.Sitemap =
    products.map((product) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
    }));

  return [...staticPages, ...productPages];
}
