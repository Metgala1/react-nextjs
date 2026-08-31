"use client"

import { useState, type FormEvent } from "react";
import { createProducService } from "@/app/services/product.service";

export type Product = {
    name: string;
    price: number;
};

function CreateProduct() {
    const [formData, setFormData] = useState<Product>({
        name: "",
        price: 0,
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setMessage("");

        if (!formData.name.trim()) {
            setMessage("Product name is required")
            return
            }

            if (!formData.price || Number(formData.price) <= 0) {
            setMessage("Price must be greater than 0")
            return
            }

        try {
            const data = await createProducService(formData.name, formData.price);

            if (!data) {
                setMessage("Could not create product");
                return;
            }

            const successMessage = data.message || "Product created successfully!";
            setMessage(successMessage);
            alert(successMessage);

            // Reset form on success
            setFormData({
                name: "",
                price: 0,
            });
        } catch (error) {
            setMessage("An error occurred while creating the product.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Product Name</label>
                <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    required
                />
            </div>

            <div>
                <label htmlFor="price">Price</label>
                <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                        }))
                    }
                    required
                />
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Product"}
            </button>

            {message && <p>{message}</p>}
        </form>
    );
}

export default CreateProduct;
