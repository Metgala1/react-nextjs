// components/home/Hero.tsx
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-white pt-16 pb-24 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">
                            Next-Gen Tech Store
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                            Elevate your digital <span className="text-indigo-600">lifestyle</span>.
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                            Discover high-performance hardware, immersive audio, and premium accessories built for modern creators and professionals.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link 
                                href="/products" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-7 py-3.5 rounded-xl shadow-sm transition-colors"
                            >
                                Browse Catalog
                            </Link>
                            <Link 
                                href="/about" 
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-7 py-3.5 rounded-xl transition-colors"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur-lg opacity-25"></div>
                        <div className="relative bg-slate-900 rounded-3xl p-2 shadow-xl overflow-hidden">
                            <img 
                                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80" 
                                alt="Featured Product" 
                                className="w-full h-[380px] object-cover rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
