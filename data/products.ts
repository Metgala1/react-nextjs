export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    rating: number;
    reviewsCount: number;
    description: string;
    specs: string[];
    image: string;
}

 
export const products:Product[] = [
        {
            id: 1,
            name: "Macbook Pro 16\"",
            price: 2499,
            category: "Laptops",
            rating: 4.9,
            reviewsCount: 128,
            description: "Equipped with the M-series chip for ultimate performance, stunning Liquid Retina XDR display, and all-day battery life to power through your most demanding professional workflows.",
            specs: ["Apple M-Series Processor", "16GB Unified Memory", "512GB SSD Storage", "22-Hour Battery Life"],
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            name: "iPhone 15 Pro",
            price: 999,
            category: "Smartphones",
            rating: 4.8,
            reviewsCount: 342,
            description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile pro camera system than ever before.",
            specs: ["A17 Pro Chip with 6-core GPU", "Pro Camera System", "Titanium Design", "USB-C Support"],
            image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            name: "Sony WH-1000XM5",
            price: 399,
            category: "Audio",
            rating: 4.7,
            reviewsCount: 215,
            description: "Industry-leading noise cancellation with two processors and eight microphones for unprecedented quiet and crystal-clear hands-free calling.",
            specs: ["Industry-Leading ANC", "30-Hour Battery Life", "Multipoint Connection", "Ultra-Comfortable Fit"],
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 4,
            name: "iPad Air 11\"",
            price: 599,
            category: "Tablets",
            rating: 4.9,
            reviewsCount: 94,
            description: "Powered by the incredible Apple M2 chip, featuring a brilliant Liquid Retina display, Touch ID, and support for Apple Pencil Pro.",
            specs: ["Apple M2 Chip", "11-inch Liquid Retina Display", "12MP Ultra Wide Front Camera", "Wi-Fi 6E Support"],
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 5,
            name: "Apple Watch Series 9",
            price: 399,
            category: "Wearables",
            rating: 4.8,
            reviewsCount: 180,
            description: "Smarter, brighter, and faster. Featuring a magical new double tap gesture, a brighter display, and carbon-neutral case and band combinations.",
            specs: ["S9 SiP Processor", "Always-On Retina Display", "Advanced Health Sensors", "Swimproof Design"],
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 6,
            name: "Macbook Pro 16\"",
            price: 2499,
            category: "Laptops",
            rating: 4.9,
            reviewsCount: 128,
            description: "Equipped with the M-series chip for ultimate performance, stunning Liquid Retina XDR display, and all-day battery life.",
            specs: ["Apple M-Series", "16GB RAM", "512GB SSD", "22-Hour Battery"],
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 7,
            name: "iPhone 15 Pro",
            price: 999,
            category: "Smartphones",
            rating: 4.8,
            reviewsCount: 342,
            description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a pro camera system.",
            specs: ["A17 Pro Chip", "Pro Camera", "Titanium Design", "USB-C Support"],
            image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 8,
            name: "Sony WH-1000XM5",
            price: 399,
            category: "Audio",
            rating: 4.7,
            reviewsCount: 215,
            description: "Industry-leading noise cancellation with two processors and eight microphones for unprecedented quiet and clarity.",
            specs: ["Active Noise Cancelling", "30-Hour Battery", "Multipoint", "Ultra-Comfort"],
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 9,
            name: "iPad Air 11\"",
            price: 599,
            category: "Tablets",
            rating: 4.9,
            reviewsCount: 94,
            description: "Powered by the incredible Apple M2 chip, featuring a brilliant Liquid Retina display and support for Apple Pencil Pro.",
            specs: ["Apple M2 Chip", "11\" Liquid Retina", "12MP Camera", "Wi-Fi 6E"],
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 10,
            name: "Apple Watch Series 9",
            price: 399,
            category: "Wearables",
            rating: 4.8,
            reviewsCount: 180,
            description: "Smarter, brighter, and faster. Featuring a magical new double tap gesture, brighter display, and advanced health sensors.",
            specs: ["S9 SiP Processor", "Always-On Retina", "Health Sensors", "Swimproof"],
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        }
    ];