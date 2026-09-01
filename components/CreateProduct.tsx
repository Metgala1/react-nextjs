// components/CreateProductForm.tsx
"use client";

import { useTransition } from "react";
import { createProduct } from "@/actions/products.action";

export default function CreateProductForm() {
    const [isPending ] = useTransition()


    return (
        <form action={createProduct}  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
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
                        defaultValue={0}
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
                        defaultValue="Laptops"
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
                        defaultValue={5.0}
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
                        defaultValue={0}
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
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
                {isPending ? "Publishing Product..." : "Publish Product"}
            </button>
        </form>
    );
}
