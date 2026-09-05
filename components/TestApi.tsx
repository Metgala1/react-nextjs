"use client"

import { Product } from "@/sevices/product.service";
import { useEffect, useState } from "react";

export default function TestApi() {
    const [products , setProducts] = useState<Product[] | null>(null)
    const [loading , setLoading] = useState(true)
    const [error , setError] = useState("")

    useEffect(() => {
        async function getProduct() {
            try{
                setLoading(true)
                const response = await fetch(`http://localhost:3000/api/products`)
                const result = await response.json()
                setProducts(result)

            }catch(err) {
                setError("Error fetching products")
            }finally {
                setLoading(false)
            }
        }
        getProduct()
    }, [])

    if(loading) {
        return <p>Loading.....</p>
    }

    if(!products) {
        return <p>No products found</p>
    }

    if(error) {
        return <p>{error}</p>
    }

    return (
        <div>
            {products.map((prod) => (
                <div key={prod.id}>
                <p>{prod.name}</p>
                <p>{prod.category}</p>
                <p>{prod.price}</p>
                </div>
            ))}
        </div>
    )

}