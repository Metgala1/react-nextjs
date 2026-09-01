"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get current values from URL query parameters
    const currentSearch = searchParams.get("search") ?? ""
    const currentCategory = searchParams.get("category") ?? "all"

    const [search, setSearch] = useState(currentSearch)
    const [category, setCategory] = useState(currentCategory)

    // Handle form submit for text search
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        updateUrl(search, category)
        setSearch("")
    }

    // Handle category change instantly on select change
    function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const newCategory = event.target.value
        setCategory(newCategory)
        updateUrl(search, newCategory)
    }

    // Helper function to update the URL with both parameters
    function updateUrl(searchQuery: string, categoryFilter: string) {
        const params = new URLSearchParams(searchParams.toString())

        if (searchQuery.trim()) {
            params.set("search", searchQuery)
        } else {
            params.delete("search")
        }

        if (categoryFilter && categoryFilter !== "all") {
            params.set("category", categoryFilter)
        } else {
            params.delete("category")
        }

        router.push(`/products?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-4 hidden sm:flex items-center gap-2">
            {/* Category Dropdown Filter */}
            <div className="shrink-0">
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="bg-slate-100/80 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                    <option value="all">All Categories</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Audio">Audio</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Monitors">Monitors</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Drones">Drones</option>
                </select>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    🔍
                </span>
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="Search products..." 
                    className="w-full bg-slate-100/80 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>
        </form>
    )
}
