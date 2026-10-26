import { describe, expect, it } from "vitest";
import { createProductSchema } from "@/validation/product";

const validProduct = {
    name: "MacBook Air",
    price: 1200,
    category: "Laptops",
    rating: 4,
    reviewsCount: 20,
    description: "A lightweight laptop for everyday work",
    specs: ["16GB RAM", "512GB SSD"],
    image: "https://example.com/macbook.jpg",
    quantity: 5,
};

describe("createProductSchema", () => {
    it("accepts valid product data", () => {
        const result = createProductSchema.safeParse(validProduct);

        expect(result.success).toBe(true);
    });

    it("rejects an empty product name", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            name: "",
        });

        expect(result.success).toBe(false);
        if(!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: "Product name is required",
                    path: ["name"]
                })
            )
        }
    });

    it("rejects a negative price", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            price: -100,
        });

        expect(result.success).toBe(false);
    });

    it("rejects a rating greater than 5", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            rating: 6,
        });

        expect(result.success).toBe(false);
    });

    it("rejects a description shorter than 10 characters", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            description: "Laptop",
        });

        expect(result.success).toBe(false);
        if(!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: "Description must be at least 10 characters long",
                    path: ["description"]
                })
            )
        }
    });

    it("rejects an empty specifications array", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            specs: [],
        });

        expect(result.success).toBe(false);
    });

    it("converts a numeric string into a number", () => {
        const result = createProductSchema.safeParse({
            ...validProduct,
            price: "1200",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.price).toBe(1200);
            expect(typeof result.data.price).toBe("number");
        }
    });
});
