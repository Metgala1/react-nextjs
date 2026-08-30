"use client";

import { useParams } from "next/navigation";

export default function ProductDetail() {
    const params = useParams();
    // Alternatively, destructure directly: const { id } = useParams();
    
    const products = [
        {
            id: 1,
            name: "Macbook",
            price: 999
        },
        {
            id: 2,
            name: "Iphone",
            price: 879
        }
    ];

    // Access the 'id' property from the params object and convert it to a number
    const product = products.find((prod) => prod.id === Number(params.id));

    return (
        <div>
            <h1>{product?.name ?? "Product not found"}</h1>
            <p>${product?.price}</p>
        </div>
    );
}
