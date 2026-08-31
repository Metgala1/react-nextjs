// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | StoreFront",
  description: "Learn more about StoreFront and our mission to bring you the best technology.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">
                        Our Story
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Building the future of tech retail.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        StoreFront was founded with a simple goal: to curate the world&apos;s finest technology and make it accessible to creators, professionals, and enthusiasts everywhere.
                    </p>
                </div>

                {/* Image Grid Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
                    <div className="bg-slate-100 rounded-2xl overflow-hidden h-48 sm:h-64">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" 
                            alt="Team collaboration" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="bg-slate-100 rounded-2xl overflow-hidden h-48 sm:h-64 sm:-translate-y-6">
                        <img 
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80" 
                            alt="Workspace" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="bg-slate-100 rounded-2xl overflow-hidden h-48 sm:h-64">
                        <img 
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80" 
                            alt="Modern office" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                        <div className="w-10 h-10 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center mb-4 text-sm shadow-sm">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Uncompromising Quality</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Every piece of hardware in our catalog goes through rigorous standards to ensure it meets the high demands of modern professionals.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                        <div className="w-10 h-10 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center mb-4 text-sm shadow-sm">
                            02
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Customer First</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            From fast global shipping to dedicated around-the-clock technical assistance, your experience is at the core of everything we do.
                        </p>
                    </div>
                </div>

                {/* Call to Action Box */}
                <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Ready to upgrade your workflow?</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Explore our hand-picked selection of high-performance tools and devices designed for excellence.
                        </p>
                        <a 
                            href="/products" 
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-8 py-3.5 rounded-xl shadow-sm transition-colors"
                        >
                            Browse Products
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
