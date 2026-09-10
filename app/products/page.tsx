import { getProducts } from "@/sevices/product.service";
import ProductCard from "@/components/ProductsCard";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import PaginationBar from "@/components/PaginationBar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Products | StoreFront",
    description: "Explore and discover our variety of products"
}

interface SearchParamsProps {
    searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

async function ProductList({ search, category, page }: { search?: string; category?: string; page?: string }) {
    const { products } = await getProducts(search, category, page);

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-full">
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                    No products found
                </h3>
                <p className="text-slate-500 text-sm">
                    There are currently no products matching your criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={{
                        ...product,
                        category: product.category?.name ?? "",
                    }}
                />
            ))}
        </div>
    );
}

export default async function ProductsPage({ searchParams }: SearchParamsProps) {
    const { search, category, page } = await searchParams;
    
    // Fetch data here as well or pass metadata back up. 
    // For cleaner architecture, we fetch pagination metadata here or update ProductList to render the bar.
    const { totalPages, currentPage } = await getProducts(search, category, page);

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mb-3 inline-block">
                            Catalog
                        </span>

                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                            Explore Products
                        </h1>

                        <p className="mt-2 text-slate-600 text-sm max-w-xl">
                            Discover our curated collection of high-performance
                            technology designed to elevate your everyday workflow
                            and lifestyle.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 text-sm text-slate-500 font-medium">
                       Page {currentPage} / {totalPages}
                    </div>
                </div>

                <Suspense fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                }>
                    <ProductList search={search} category={category} page={page} />
                </Suspense>

                <PaginationBar totalPages={totalPages} currentPage={currentPage} />
            </div>
        </main>
    );
}

