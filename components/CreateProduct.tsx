// components/CreateProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "@/sevices/product.service";
import { Product, products } from "@/data/products";

interface CreateProduct {
    name: string;
    price: number;
    category: string;
    rating: number;
    reviewsCount: number; // Changed from reviewCount to reviewsCount
    description: string;
    specInput: string;
    image: string;
    quantity: number;
}


export default function CreateProductForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<CreateProduct>({
        name: "",
        price: 0,
        category: "Laptops",
        rating: 5.0,
        reviewsCount: 0,
        description: "",
        specInput: "",
        image: "",
        quantity: 0
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" || name === "rating" || name === "reviewCount" || name === "quantity" 
                ? Number(value) 
                : value
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const newProduct = {
            id: products.length + 1,
            name: formData.name,
            price: formData.price,
            category: formData.category,
            rating: formData.rating,
            reviewsCount: formData.reviewsCount,
            description: formData.description,
            specs: formData.specInput.split(",").map((s) => s.trim()).filter(Boolean),
            image: formData.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            quantity: formData.quantity
        };

        // Save through the product service layer utilizing localStorage
        await addProduct(newProduct);

        setIsLoading(false);
        router.push("/products");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Add New Product</h2>
                <p className="text-sm text-slate-500">Fill out the details below to add a new item to the store catalog.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Product Name</label>
                    <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Studio Display" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Price ($)</label>
                    <input 
                        type="number" 
                        name="price"
                        required
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="1299" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Category</label>
                    <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    >
                        <option value="Laptops">Laptops</option>
                        <option value="Smartphones">Smartphones</option>
                        <option value="Audio">Audio</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Wearables">Wearables</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Monitors">Monitors</option>
                        <option value="Cameras">Cameras</option>
                        <option value="Drones">Drones</option>
                    </select>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Rating</label>
                    <input 
                        type="number" 
                        name="rating"
                        step="0.1" 
                        min="1" 
                        max="5"
                        value={formData.rating}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Review Count */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Review Count</label>
                    <input 
                        type="number" 
                        name="reviewsCount"
                        min="0"
                        value={formData.reviewsCount}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Description</label>
                <textarea 
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a comprehensive product description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>

            {/* Specifications Input */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Specifications (comma separated)</label>
                <input 
                    type="text" 
                    name="specInput"
                    value={formData.specInput}
                    onChange={handleChange}
                    placeholder="Retina Display, M2 Chip, 8GB RAM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Image URL</label>
                <input 
                    type="url" 
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
                {isLoading ? "Publishing Product..." : "Publish Product"}
            </button>
        </form>
    );
}
