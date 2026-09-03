import CreateProductForm from "@/components/CreateProduct"
export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        Create Product
      </h1>

      <CreateProductForm />
    </main>
  )
}