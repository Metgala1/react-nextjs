// components/AddToCartSection.tsx (Client Component)
"use client";

import { useState } from "react";

export default function AddToCartSection({ productId }: { productId: number }) {
    const [quantity, setQuantity] = useState(1);

    const handleDecrement = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const handleIncrement = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleAddToCart = () => {
        // Handle your add to cart logic here (e.g., state management, API call)
        console.log(`Added product ${productId} with quantity ${quantity} to cart`);
    };

    return (
        <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDecrement}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                    >
                        -
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-6 text-center">{quantity}</span>
                    <button 
                        onClick={handleIncrement}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-black hover:bg-green-500 hover:text-black text-white font-medium text-sm py-3 px-6 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                    Add to Cart
                </button>
                <button className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer">
                    Save
                </button>
            </div>
        </div>
    );
}
