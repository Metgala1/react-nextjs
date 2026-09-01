// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

export default function Header() {
    const pathname = usePathname();

    const links = [
        { href: "/", text: "Home" },
        { href: "/products", text: "Products" },
        { href: "/about", text: "About" }
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link 
                    href="/" 
                    className="text-lg font-extrabold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors shrink-0"
                >
                    Store<span className="text-indigo-600">Front</span>
                </Link>

                {/* Search Bar */}
                <SearchBar />

                {/* Navigation Links */}
                <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.text}
                                href={link.href} 
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                                    isActive 
                                        ? "text-indigo-600 bg-indigo-50 font-semibold" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                {link.text}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
