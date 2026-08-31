import type { Metadata } from "next"
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";

export const metadata: Metadata = {
  title: "StoreFront",
  description: "Your favourite products, all in one place."
}

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <Hero />
            <FeaturedProducts />
            <Features />
        </main>
    );
}