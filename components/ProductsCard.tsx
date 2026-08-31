// components/ProductCard.tsx
import Link from 'next/link';
import { Product } from '@/data/products';

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link 
            href={`/products/${product.id}`} 
            className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
            <div>
                <div className="relative bg-slate-100 aspect-square overflow-hidden flex items-center justify-center p-6">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="object-cover w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                        {product.category}
                    </span>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                        </h2>
                        <div className="flex items-center text-amber-500 text-xs font-semibold">
                            ★ <span className="ml-1 text-slate-700">{product.rating}</span>
                        </div>
                    </div>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4">
                        {product.description}
                    </p>
                </div>
            </div>

            <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto pt-4">
                <span className="text-lg font-extrabold text-slate-900">
                    ${product.price.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                    View Details &rarr;
                </span>
            </div>
        </Link>
    );
}
