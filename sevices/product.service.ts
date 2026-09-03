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

export async function getProducts(): Promise<Product[]> {
    return await prisma.product.findMany({
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
            quantity: true

        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function getProductById(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({
        where: { id },
    });
}

export async function addProduct(newProduct: CreateProduct) {
    return await prisma.product.create({
        data: newProduct,
    });
    
}
