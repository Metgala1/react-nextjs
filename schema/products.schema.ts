import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    category: z.string().min(1, "Category is required"),
    rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
    reviewsCount: z.coerce.number().min(0, "Review count cannot be negative"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    specs: z.array(z.string()).min(1, "At least one specification is required"),
    image: z.string().url("Must be a valid image URL"),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
});


export const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 6 characters long" }),
});

export type SignupInput = z.infer<typeof signupSchema>;


export type CreateProductInput = z.infer<typeof createProductSchema>;
