import CreateProductForm from "@/components/CreateProduct"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
export default async function NewProductPage() {
  const session = await getSession()

  if(!session) {
    redirect("/auth/login")
  }
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        Create Product
      </h1>

      <CreateProductForm />
    </main>
  )
}