import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const productWithCategory = {
  include: {
    category: true,
  },
} satisfies Prisma.ProductDefaultArgs;

export type ProductWithCategory = Prisma.ProductGetPayload<
  typeof productWithCategory
>;


export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  rating: number;
  reviewsCount: number;
  description: string;
  specs: string[];
  image: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDTO {
  id: number;
  name: string;
  price: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  rating: number;
  reviewsCount: number;
  description: string;
  specs: string[];
  image: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProduct {
  name: string;
  price: number;
  category: string;
  rating: number;
  reviewsCount: number;
  description: string;
  specs: string[];
  image: string;
  quantity: number;
}

export interface UpdateProduct {
  name?: string;
  price?: number;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  specs?: string[];
  image?: string;
  quantity?: number;
}

export async function getProducts(
  search?: string,
  category?: string,
  page?: string
) {
  const pageSize = 4;
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * pageSize;

  const whereClause = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(category && category.toLowerCase() !== "all"
      ? {
          category: {
            name: {
              equals: category,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      include: {
        category: true,
      },
      orderBy: {
        rating: "desc",
      },
    }),

    prisma.product.count({
      where: whereClause,
    }),
  ]);

  return {
    products,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage,
  };
}

export async function getProductById(id: number): Promise<ProductDTO> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true
    },
  });

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  return product;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    take: 4,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createProduct(
  productData: CreateProduct
): Promise<Product> {
  const { category: categoryName, ...rest } = productData;

  const categorySlug = categoryName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const categoryRecord = await prisma.category.upsert({
    where: {
      slug: categorySlug,
    },
    update: {},
    create: {
      name: categoryName,
      slug: categorySlug,
    },
  });

  return prisma.product.create({
    data: {
      ...rest,
      categoryId: categoryRecord.id,
    },
    include: {
      category: true,
    },
  });
}

export async function addProduct(
  productData: CreateProduct
): Promise<Product> {
  return createProduct(productData);
}

export async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function updateProduct(
  id: number,
  productData: UpdateProduct
): Promise<Product> {
  const { category, ...rest } = productData;

  let categoryId: number | undefined;

  if (category) {
    const categorySlug = category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const categoryRecord = await prisma.category.upsert({
      where: {
        slug: categorySlug,
      },
      update: {},
      create: {
        name: category,
        slug: categorySlug,
      },
    });

    categoryId = categoryRecord.id;
  }

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      ...rest,
      ...(categoryId !== undefined ? { categoryId } : {}),
    },
    include: {
      category: true,
    },
  });
}