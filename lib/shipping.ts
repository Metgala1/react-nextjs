export async function getShippingRates() {
    const respons = await fetch(
        "https://api.example.com/shipping/rates",
        {
            next: {
                revalidate: 300
            }
        }
    )

    if(!respons.ok) {
        throw new Error("Failed to fetch shipping rates")
    }

    return respons.json()
}