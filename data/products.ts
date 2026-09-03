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
    quantity: number;
}

export const products = [
    {
        id: 1,
        name: "Macbook Pro 16\"",
        price: 2499,
        category: "Laptops",
        rating: 4.9,
        reviewsCount: 128,
        description: "Equipped with the M-series chip for ultimate performance, stunning Liquid Retina XDR display, and all-day battery life to power through your most demanding professional workflows.",
        specs: ["Apple M-Series Processor", "16GB Unified Memory", "512GB SSD Storage", "22-Hour Battery Life"],
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        quantity: 0
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
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
        quantity: 0
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
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        quantity: 0
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
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
        quantity: 0
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
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    },
    {
        id: 6,
        name: "Logitech MX Master 3S",
        price: 99,
        category: "Accessories",
        rating: 4.9,
        reviewsCount: 412,
        description: "An iconic mouse remastered for ultimate comfort, precision, and tactile performance. Features 8K DPI track-on-glass sensor and quiet clicks.",
        specs: ["8000 DPI Sensor", "Quiet Clicks", "MagSpeed Electromagnetic Scrolling", "USB-C Quick Charging"],
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    },
    {
        id: 7,
        name: "Keychron Q1 Pro",
        price: 199,
        category: "Accessories",
        rating: 4.7,
        reviewsCount: 165,
        description: "A fully customizable wireless mechanical keyboard featuring a premium CNC aluminum body, gasket mount design, and hot-swappable support.",
        specs: ["Wireless & Wired Modes", "CNC Aluminum Body", "Hot-Swappable Switches", "QMK/VIA Support"],
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    },
    {
        id: 8,
        name: "Dell UltraSharp 27 4K",
        price: 649,
        category: "Monitors",
        rating: 4.8,
        reviewsCount: 88,
        description: "Experience extraordinary color and clarity on a 27-inch 4K hub monitor featuring IPS Black technology and ComfortView Plus.",
        specs: ["4K UHD 3840 x 2160 Resolution", "IPS Black Technology", "98% DCI-P3 Color", "USB-C Hub (90W Power Delivery)"],
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    },
    {
        id: 9,
        name: "Fujifilm X-T50",
        price: 1399,
        category: "Cameras",
        rating: 4.9,
        reviewsCount: 76,
        description: "A lightweight mirrorless camera packed with a 40MP X-Trans CMOS 5 HR sensor, in-body image stabilization, and classic film simulation dials.",
        specs: ["40.2MP APS-C Sensor", "7-Stop In-Body Stabilization", "6.2K/30p Video Recording", "Film Simulation Dial"],
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    },
    {
        id: 10,
        name: "DJI Mini 4 Pro",
        price: 759,
        category: "Drones",
        rating: 4.9,
        reviewsCount: 230,
        description: "Our most advanced mini camera drone to date. Features omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting, and extended flight time.",
        specs: ["Under 249g Weight", "4K/60fps HDR Video", "Omnidirectional Obstacle Sensing", "20km Max Transmission Range"],
        image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
        quantity: 0
    }
];
