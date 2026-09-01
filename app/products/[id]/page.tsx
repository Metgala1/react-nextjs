// app/products/[id]/page.tsx (Server Component)
import { getProductById } from "@/sevices/product.service";
import { notFound } from "next/navigation";
import AddToCartSection from "@/components/AddToCartSection";

type Props = {
    params: Promise<{id: string}>
}

export default async function ProductDetail({params}: Props) {
    const {id} = await params
    
    const product = await getProductById(Number(id))

    if (!product) {
        notFound()
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

                        {/* Interactive Client Component for Quantity & Cart Actions */}
                        <AddToCartSection productId={product.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
