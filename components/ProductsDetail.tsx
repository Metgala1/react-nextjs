import { Product } from "@/sevices/product.service"
import AddToCartSection from "./AddToCartSection"
import { getProductImageUrl } from "@/lib/supabase/storage"
import Image from "next/image"

export default async function ProductDetails(product: Product) {
    const imageUrl = await getProductImageUrl(product.image)
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

                    {/* Product Image Section */}
                    <div className="relative bg-slate-100 p-8 flex items-center justify-center min-h-[350px]">
                        {product.image ? (
                            <Image
                                src={imageUrl}
                                alt={product.name}
                                className="object-cover w-full h-full max-h-[450px] rounded-2xl shadow-md"
                                fill
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                                <div className="p-4 bg-white rounded-full shadow-xs">
                                    <svg
                                        className="w-8 h-8 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium tracking-wide uppercase">No Image Available</span>
                            </div>
                        )}

                        <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs">
                            {product.category?.name}
                        </span>
                    </div>


                    {/* Product Details Section */}
                    <div className="p-8 sm:p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center text-amber-500 text-sm font-semibold">
                                    ★
                                    <span className="ml-1 text-slate-700">
                                        {product.rating}
                                    </span>

                                    <span className="text-slate-400 font-normal ml-1">
                                        ({product.reviewsCount})
                                    </span>
                                </div>
                            </div>

                            <div className="text-2xl font-extrabold text-slate-900 mb-6">
                                ${product.price.toLocaleString()}
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {product.description}
                            </p>

                            <div className="border-t border-slate-100 pt-6 mb-8">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                                    Key Specifications
                                </h3>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {product.specs.map((spec, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100"
                                        >
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                                            {spec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Client Component */}
                        <AddToCartSection productId={product.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}