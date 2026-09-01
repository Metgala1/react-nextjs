import { getProducts } from '@/sevices/product.service';
import ProductCard from '@/components/ProductsCard';
import { Product } from '@/data/products';

type Props = {
    searchParams: Promise<{search?: string}>
}

export default async function ProductsPage({searchParams}: Props) {
    const products: Product[] = await getProducts()
    const {search} = await searchParams
    const searchTerm = search?.toLowerCase() ?? ''
    const filteredProduct = products.filter((prod) => prod.name.toLowerCase().includes(searchTerm))
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

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProduct.map((product) => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </div>
            </div>
        </main>
    );
}
