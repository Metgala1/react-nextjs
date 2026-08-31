import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link 
                    href="/" 
                    className="text-lg font-extrabold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors"
                >
                    Store<span className="text-indigo-600">Front</span>
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                    <Link 
                        href="/" 
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Home
                    </Link>
                    <Link 
                        href="/products" 
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Products
                    </Link>
                    <Link 
                        href="/about" 
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
}
