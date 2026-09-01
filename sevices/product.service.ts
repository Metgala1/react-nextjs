// services/product.service.ts
import { products as initialProducts, Product } from "@/data/products";

export async function getProducts(): Promise<Product[]> {
    if (typeof window === "undefined") {
        return initialProducts;
    }

    const saved = localStorage.getItem("store_products");
    if (!saved) {
        localStorage.setItem("store_products", JSON.stringify(initialProducts));
        return initialProducts;
    }

    try {
        const parsed = JSON.parse(saved);
        // Ensure it's valid and contains items
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (e) {
        console.error("Failed to parse store_products from localStorage", e);
    }

    localStorage.setItem("store_products", JSON.stringify(initialProducts));
    return initialProducts;
}

export async function getProductById(id: number): Promise<Product | undefined> {
    const allProducts = await getProducts();
    return allProducts.find((p) => p.id === id);
}

export async function addProduct(newProduct: Product) {
    const allProducts = await getProducts();
    const updatedProducts = [newProduct, ...allProducts];
    localStorage.setItem("store_products", JSON.stringify(updatedProducts));
}
