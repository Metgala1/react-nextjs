import { getExpernalProducts, type Product } from "@/lib/externalProducts";

export default async function Page() {
    const products: Product[]  = await getExpernalProducts();

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">External Products</h1>
                    <p className="mt-1 text-sm text-slate-500">Fetched directly from your custom Express API backend.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((prod) => (
                        <div 
                            key={prod.id}
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-3">
                                    Product #{prod.id}
                                </span>
                                <h2 className="text-lg font-semibold text-slate-800 line-clamp-1">{prod.name}</h2>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xl font-bold text-slate-900">
                                    ${prod.price.toFixed(2)}
                                </span>
                                <button className="px-3.5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
