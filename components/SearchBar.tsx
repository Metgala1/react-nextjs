"use client"
import {  useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentSearch =  searchParams.get("search") ?? ""

    const [search , setSearch] = useState(currentSearch)

    function handlSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const params = new URLSearchParams(searchParams.toString())

        if(search.trim()) {
            params.set("search", search)
        }else {
            params.delete("search")
        }
        router.push(`/products?${params.toString()}`)
    }

    return (
        <form onSubmit={handlSubmit} className="flex-1 max-w-md mx-4 hidden sm:block">
                    <div className="relative">
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