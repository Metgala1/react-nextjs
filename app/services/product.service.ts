export async function createProducService(name: string, price: number) {
    const token = localStorage.getItem("token")

    const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, price }),
    })

    return response.json()
}