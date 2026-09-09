import { getShippingRates } from "@/lib/shipping"

export default async function ShippingPage() {
  const rates = await getShippingRates()

  return (
    <main>
      <h1>Shipping</h1>

      {rates.map((rate: any) => (
        <div key={rate.id}>
          {rate.name}
        </div>
      ))}
    </main>
  )
}