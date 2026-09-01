// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/sevices/product.service";
import ProductCard from "@/components/ProductsCard";
import { Product } from "@/data/products";

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            const data = await getProducts();
            setProducts(data);
            setIsLoading(false);
        }
        loadProducts();
    }, []);

    const searchTerm = search?.toLowerCase() ?? '';
    const selectedCategory = category?.toLowerCase() ?? 'all';

    const filteredProduct = products.filter((prod) => {
        const matchesSearch = prod.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || prod.category.toLowerCase() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="text-slate-500 text-sm font-medium">Loading products...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
                            Catalog
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Explore Products
                        </h1>
                        <p className="mt-2 text-slate-600 text-sm max-w-xl">
                            Discover our curated collection of high-performance technology designed to elevate your everyday workflow and lifestyle.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-slate-500 font-medium">
                        Showing <span className="text-slate-900 font-bold">{filteredProduct.length}</span> results
                    </div>
                </div>

                {/* Product Grid / Empty State */}
                {filteredProduct.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProduct.map((product) => (
                            <ProductCard key={product.name} product={product}/>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                            🔍
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search or category filter to find what you&apos;re looking for.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
