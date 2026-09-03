// actions/products.action.ts
"use server";

import { addProduct } from "@/sevices/product.service";
import { redirect } from "next/navigation";
import { createProductSchema } from "@/validation/product";

export type CreateProductState = {
  success: boolean
  message: string
  errors?: {
    name?: string[]
    price?: string[]
    category?: string[]
    rating?: string[]
    reviewsCount?: string[]
    description?: string[]
    specs?: string[]
    image?: string[]
    quantity?: string[]
  }
}

export async function createProduct(previousState: CreateProductState, formData: FormData): Promise<CreateProductState> {
    const specInput = (formData.get("specInput") as string) || "";
    const specs = specInput.split(",").map((s) => s.trim()).filter(Boolean);

    const result = createProductSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        category: formData.get("category"),
        rating: formData.get("rating"),
        reviewsCount: formData.get("reviewsCount"),
        description: formData.get("description"),
        specs: specs,
        image: formData.get("image") || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        quantity: formData.get("quantity") || 0
    });

    if (!result.success) {
        return {
            success: false,
            message: "Validation failed. Please check the fields below.",
            errors: result.error.flatten().fieldErrors,
        };
    }

    const newProduct = {
        ...result.data,
        id: Date.now(),
    };

    await addProduct(newProduct);

    return {
        success: true,
        message: "Product created successfully"
    }

    
}
