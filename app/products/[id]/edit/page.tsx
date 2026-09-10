import EditProductForm from "@/components/EditProductForm"
import { getSession } from "@/lib/auth"
import { getProductById } from "@/sevices/product.service"
import { redirect } from "next/navigation"
import notFound from "../../not-found"

export interface Product {
    id: number;
    name: string;
    price: number;
    categoryId: number;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    rating: number;
    reviewsCount: number;
    description: string;
    specs: string[];
    image: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productId = Number(id);

    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    if (Number.isNaN(productId)) {
        notFound();
    }

    const product: Product = await getProductById(productId);

    if (!product) {
        notFound();
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="mb-8 text-3xl font-bold">
                Edit Product
            </h1>

            <EditProductForm product={product} />
        </main>
    );
}
