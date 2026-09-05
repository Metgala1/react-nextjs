import {prisma} from "@/lib/prisma"
import { createProductSchema } from "@/schema/products.schema"
import { createProduct } from "@/sevices/product.service"
import { getProducts } from "@/sevices/product.service"

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const category = url.searchParams.get("category")?.trim() || "all";

  try {
    // Build dynamic query conditions for Prisma
    const whereCondition: any = {};

    // Handle search query (filters by name or description)
    if (search !== "") {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Handle category filter (skip if "all" or empty)
    if (category.toLowerCase() !== "all" && category !== "") {
      whereCondition.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { rating: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




export async function POST(request: Request) {
    const body = await request.json()

    const result = createProductSchema.safeParse(body)

    if(!result.success) {
        return Response.json({
            success: false,
            message: result.error.flatten().fieldErrors,
        },
        {
            status: 400
        }
    )
    }

    const product = await createProduct(result.data)

    return Response.json(product)

}
