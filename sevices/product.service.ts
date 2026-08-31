import { Product } from "@/data/products";
import { products } from "@/data/products";

export async function getProducts() {
    return await products
}

export async function getProductById(id: number) {
    return products.find((prod) => prod.id === id)
}