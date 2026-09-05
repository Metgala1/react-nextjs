// services/product.service.ts
import { prisma } from "@/lib/prisma"

export interface Product {
    id: number;
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

export async function getProducts(search?: string, query?: string): Promise<Product[]> {
    const searchTerm = query || search;
    await new Promise((resolve) => setTimeout(resolve , 1000))

    return await prisma.product.findMany({
        where: searchTerm ? {
            OR: [
                {
                    name: {
                        contains: searchTerm,
                        mode: "insensitive", // Fixed typo: "insesitive" -> "insensitive"
                    },
                },
                {
                    category: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
        } : undefined,
        select: {
            id: true,
            name: true,
            price: true,
            category: true,
            rating: true,
            reviewsCount: true,
            description: true,
            specs: true,
            image: true,
            quantity: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}


export async function getProductById(id: number): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve , 1000))
    return await prisma.product.findUnique({
        where: { id },
    });
}

export async function addProduct(newProduct: CreateProduct) {
    return await prisma.product.create({
        data: newProduct,
    });
    
}

export async function getFeaturedProducts() {
    await new Promise((resolve) => setTimeout(resolve , 1000))
    return await prisma.product.findMany({
        take: 4
    })
}

export async function createProduct(product: CreateProduct):Promise<Product> {
    return await prisma.product.create({
        data: product
    })

}