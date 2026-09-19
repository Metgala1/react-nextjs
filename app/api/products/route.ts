import { getCurrentUser } from "@/lib/auth";
import { createProductSchema } from "@/schema/products.schema";
import { createProduct } from "@/sevices/product.service";
import { hasPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { getProducts } from "@/sevices/product.service";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const search = url.searchParams.get("search")?.trim() || "";
  const category = url.searchParams.get("category")?.trim() || "all";
  const page = url.searchParams.get("page") || undefined;

  try {
    const products = await getProducts(search , category , page)

    return NextResponse.json(products.products);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    if (!hasPermission(user.UserRole, "products:create")) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const product = await createProduct(result.data);

    return NextResponse.json(
      {
        success: true,
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to create product:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}