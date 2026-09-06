// components/HeaderLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderLinksProps {
    links: { href: string; text: string }[];
}

export default function HeaderLinks({ links }: HeaderLinksProps) {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link 
                        key={link.text}
                        href={link.href} 
                        className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
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
    );
}
