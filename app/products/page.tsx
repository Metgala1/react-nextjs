import { getProducts } from "@/sevices/product.service";
import ProductCard from "@/components/ProductsCard";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

interface SearchParamsProps {
    searchParams: Promise<{ search?: string; category?: string }>;
}

// 1. Isolate the data-fetching and rendering into its own component
async function ProductList({ search, category }: { search?: string; category?: string }) {
    const products = await getProducts(search, category);

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                    🔍
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                    No products found
                </h3>
                <p className="text-slate-500 text-sm">
                    There are currently no products available.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
}

export default async function ProductsPage({ searchParams }: SearchParamsProps) {
    const { search, category } = await searchParams;

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
                            Catalog
                        </span>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Explore Products
                        </h1>

                        <p className="mt-2 text-slate-600 text-sm max-w-xl">
                            Discover our curated collection of high-performance
                            technology designed to elevate your everyday workflow
                            and lifestyle.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 text-sm text-slate-500 font-medium">
                        Catalog Results
                    </div>
                </div>

                {/* 2. Suspense wraps the async component and shows the skeleton grid while fetching */}
                <Suspense fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                }>
                    <ProductList search={search} category={category} />
                </Suspense>
            </div>
        </main>
    );
}
