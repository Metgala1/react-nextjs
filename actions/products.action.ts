// app/actions/product.actions.ts
"use server";

import { addProduct } from "@/sevices/product.service";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
    const specInput = (formData.get("specInput") as string) || "";
    const specs = specInput.split(",").map((s) => s.trim()).filter(Boolean);

    const newProduct = {
        id: Date.now(),
        name: formData.get("name") as string,
        price: Number(formData.get("price")),
        category: formData.get("category") as string,
        rating: Number(formData.get("rating")),
        reviewsCount: Number(formData.get("reviewsCount")),
        description: formData.get("description") as string,
        specs: specs,
        image: (formData.get("image") as string) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        quantity: Number(formData.get("quantity") || 0)
    };

    await addProduct(newProduct);

    redirect("/products");
}
