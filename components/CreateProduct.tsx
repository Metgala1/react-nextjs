"use client";

import { createProduct, type CreateProductState } from "@/actions/products.action";
import { useActionState } from "react";
import SubmitButton from "./SubmitButton";

const initialState: CreateProductState = {
    success: false,
    message: ""
}

export default function CreateProductForm() {
    const [state, formAction] = useActionState(
        createProduct,
        initialState
    );

    return (
        <form action={formAction} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Add New Product</h2>
                <p className="text-sm text-slate-500">Fill out the details below to add a new item to the store catalog.</p>
            </div>

            {/* General Feedback Message */}
            {state.message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${state.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Product Name</label>
                    <input 
                        type="text" 
                        name="name"
                        placeholder="e.g. Studio Display" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {state.errors?.name && (
                        <p className="mt-1 text-xs text-rose-600">{state.errors.name[0]}</p>
                    )}
                </div>

                {/* Price */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Price ($)</label>
                    <input 
                        type="number" 
                        name="price"
                        min="0"
                        defaultValue={0}
                        placeholder="1299" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    {state.errors?.price && (
                        <p className="mt-1 text-xs text-rose-600">{state.errors.price[0]}</p>
                    )}
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
                    {state.errors?.category && (
                        <p className="mt-1 text-xs text-rose-600">{state.errors.category[0]}</p>
                    )}
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
                    {state.errors?.rating && (
                        <p className="mt-1 text-xs text-rose-600">{state.errors.rating[0]}</p>
                    )}
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
                    {state.errors?.reviewsCount && (
                        <p className="mt-1 text-xs text-rose-600">{state.errors.reviewsCount[0]}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Description</label>
                <textarea 
                    name="description"
                    rows={3}
                    placeholder="Provide a comprehensive product description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {state.errors?.description && (
                    <p className="mt-1 text-xs text-rose-600">{state.errors.description[0]}</p>
                )}
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
                {state.errors?.specs && (
                    <p className="mt-1 text-xs text-rose-600">{state.errors.specs[0]}</p>
                )}
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
                {state.errors?.image && (
                    <p className="mt-1 text-xs text-rose-600">{state.errors.image[0]}</p>
                )}
            </div>

            {/* Submit Button */}
            <SubmitButton />
        </form>
    );
}
