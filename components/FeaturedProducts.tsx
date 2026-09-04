// components/home/FeaturedProducts.tsx
import ProductCard from "./ProductsCard";
import Link from "next/link";
import { getProducts } from "@/sevices/product.service";

export default async function FeaturedProducts() {
    const products = await getProducts()
    const featured = products.slice(0, 3);

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">Selected Picks</h2>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Gear</h3>
                    </div>
                    <Link href="/products" className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center">
                        View All Products &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featured.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
