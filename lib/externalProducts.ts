export interface Product {
    id: number;
    name: string,
    price: number
}


export async function getExpernalProducts():Promise<Product[]> {
    const response = await fetch("http://localhost:3001/products", {
        next: {
            revalidate: 60
        }
    })
    
    if(!response.ok) {
        throw new Error("Error fetching products")
    }

    return response.json()
}