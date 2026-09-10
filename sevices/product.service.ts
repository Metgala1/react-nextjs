// services/product.service.ts
import { prisma } from "@/lib/prisma";

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

export async function getProducts(search?: string, category?: string, page?: string) {
    const pageSize = 4
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const whereClause = {
        ...(search ? {
            name: {
                contains: search,
                mode: "insensitive" as const
            }
        } : {}),
        ...(category ? {
            category: {
                name: category,
            }
        } : {})
    };

    // Fetch products and total count concurrently
    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: { category: true } // Ensure category relation is included if needed
        }),
        prisma.product.count({ where: whereClause })
    ]);

    return {
        products,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage
    };
}


export async function getProductById(id: number): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
        },
    });

    if (!product) {
        throw new Error(`Product with id ${id} not found`);
    }

    return product;
}

export async function getFeaturedProducts(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await prisma.product.findMany({
        take: 4,
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function createProduct(productData: CreateProduct): Promise<Product> {
    const { category: categoryName, ...rest } = productData;
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

    const categoryRecord = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: {
            name: categoryName,
            slug: categorySlug,
        },
    });

    return await prisma.product.create({
        data: {
            ...rest,
            categoryId: categoryRecord.id,
        },
        include: {
            category: true,
        },
    });
}

export async function addProduct(productData: CreateProduct): Promise<Product> {
    return createProduct(productData);
}

export async function getCategories() {
    return prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true
        }
    })
}

export async function updateProducts(id: number , product: Product) {
    await prisma.product.updateMany({
        where: { id },
        data: [
            product
        ]
    })
}
