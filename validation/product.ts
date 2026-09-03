import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().trim().min(1, "Product name is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    category: z.string().trim().min(1, "Category is required"),
    rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
    reviewsCount: z.coerce.number().min(0, "Review count cannot be negative"),
    description: z.string().trim().min(10, "Description must be at least 10 characters long"),
    specs: z.array(z.string()).min(1, "At least one specification is required"),
    image: z.string().trim().url("Must be a valid image URL"),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
