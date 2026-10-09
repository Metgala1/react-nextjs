"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current values from URL query parameters
    const currentSearch = searchParams.get("search") ?? ""
    const currentCategory = searchParams.get("category") ?? "all"

    const [search, setSearch] = useState(currentSearch)
    const [category, setCategory] = useState(currentCategory)

    // One phrase per tap is what you want for search, so continuous is false
    const {
        text: spokenText,
        interimText,
        status,
        error: voiceError,
        isSupported,
        isListening,
        startListening,
        stopListening,
        clearTranscript,
    } = useSpeechRecognition({ continuous: false })

    const isBusy = status === "starting" || status === "stopping"
    const isVoiceActive = isListening || isBusy

    // While the mic is active, show the live transcript in the input
    const inputValue = isVoiceActive
        ? [spokenText, interimText].filter(Boolean).join(" ")
        : search

    // When a listening session ends, run the search with what was heard
    const wasListeningRef = useRef(false)


    function handleMicClick() {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    // Handle form submit for text search
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (isVoiceActive) return
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
    const updateUrl = useCallback(
    (searchQuery: string, categoryFilter: string) => {
        const params = new URLSearchParams(searchParams.toString());

        const normalizedQuery = searchQuery.trim();

        if (normalizedQuery) {
            params.set("search", normalizedQuery);
        } else {
            params.delete("search");
        }

        if (categoryFilter && categoryFilter !== "all") {
            params.set("category", categoryFilter);
        } else {
            params.delete("category");
        }

        const queryString = params.toString();

        router.push(
            queryString ? `/products?${queryString}` : "/products"
        );
    },
    [router, searchParams]
    );

    useEffect(() => {
    if (status === "listening") {
        wasListeningRef.current = true;
        return;
    }

    // A failed session must not trigger a search.
    if (status === "error") {
        wasListeningRef.current = false;
        return;
    }

    // Wait until a session that was listening ends.
    if (status !== "idle" || !wasListeningRef.current) {
        return;
    }

    wasListeningRef.current = false;

    const spoken = spokenText.trim();

    if (!spoken) {
        clearTranscript();
        return;
    }

    setSearch(spoken);
    updateUrl(spoken, category);
    clearTranscript();
    
    }, [
    status,
    spokenText,
    category,
    updateUrl,
    clearTranscript,
    ]);

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
                    value={inputValue}
                    onChange={(e) => setSearch(e.target.value)}
                    readOnly={isVoiceActive}
                    placeholder={isListening ? "Listening…" : "Search products..."}
                    className={`w-full bg-slate-100/80 border border-slate-200 text-sm rounded-xl pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                        isSupported ? "pr-12" : "pr-4"
                    } ${isVoiceActive ? "text-slate-500 italic" : "text-slate-900"}`}
                />

                {/* Mic button */}
                {isSupported && (
                    <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isBusy}
                        aria-pressed={isListening}
                        aria-label={isListening ? "Stop voice search" : "Start voice search"}
                        className={`absolute inset-y-0 right-1.5 my-auto flex h-8 w-8 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                            isListening
                                ? "bg-rose-500 text-white animate-pulse"
                                : "text-slate-500 hover:bg-slate-200 hover:text-indigo-600"
                        }`}
                    >
                        {isListening ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <rect x="9" y="2" width="6" height="12" rx="3" />
                                <path d="M5 11a7 7 0 0 0 14 0" />
                                <path d="M12 18v4" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Voice error */}
                {voiceError && (
                    <p
                        role="alert"
                        className="absolute left-1 top-full mt-1 text-xs font-medium text-rose-600"
                    >
                        {voiceError}
                    </p>
                )}
            </div>
        </form>
    )
}