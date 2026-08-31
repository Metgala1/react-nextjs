import { getProductById, getProducts } from "@/sevices/product.service";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{id: string}>
}

export default async function ProductDetail({params}: Props) {
    const {id} = await params
    
    const product = await getProductById(Number(id))



    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        !
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Product Not Found</h1>
                    <p className="text-slate-600 text-sm mb-6">The product you are looking for might have been removed or does not exist.</p>
                    <a href="/" className="inline-block bg-slate-900 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    
                    {/* Product Image Section */}
                    <div className="relative bg-slate-100 p-8 flex items-center justify-center min-h-[350px]">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="object-cover w-full h-full max-h-[450px] rounded-2xl shadow-md"
                        />
                        <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs">
                            {product.category}
                        </span>
                    </div>

                    {/* Product Details Section */}
                    <div className="p-8 sm:p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
                                <div className="flex items-center text-amber-500 text-sm font-semibold">
                                    ★ <span className="ml-1 text-slate-700">{product.rating}</span>
                                    <span className="text-slate-400 font-normal ml-1">({product.reviewsCount})</span>
                                </div>
                            </div>

                            <div className="text-2xl font-extrabold text-slate-900 mb-6">
                                ${product.price.toLocaleString()}
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {product.description}
                            </p>

                            <div className="border-t border-slate-100 pt-6 mb-8">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Key Specifications</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {product.specs.map((spec, index) => (
                                        <li key={index} className="flex items-center text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                                            {spec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 px-6 rounded-xl shadow-sm transition-colors cursor-pointer">
                                Add to Cart
                            </button>
                            <button className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
