import { getCurrentUser, requirePermission } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { deleteProduct, getProductById, updateProduct } from "@/sevices/product.service"

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: Request,
  { params }: Props
) {
  const { id } = await params

  const productId = Number(id)

  if (Number.isNaN(productId)) {
    return Response.json(
      {
        message: "Invalid product ID",
      },
      {
        status: 400,
      }
    )
  }

  const product = await getProductById(productId)

  if (!product) {
    return Response.json(
      {
        message: "Product not found",
      },
      {
        status: 404,
      }
    )
  }

  return Response.json(product)
}
import { updateProductSchema } from "@/validation/product"
import { z } from "zod"

export type UpdateProduct = z.infer<typeof updateProductSchema>

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params
  const body = await request.json()

  const productId = Number(id)
  if (Number.isNaN(productId) || productId < 0) {
    return Response.json({ message: "Invalid productId" }, { status: 404 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ message: "Authentication required" }, { status: 401 })
  }

  if (!hasPermission(user.UserRole, "products:update")) {
    return Response.json({ message: "User does not have permission" }, { status: 403 })
  }

  const result = updateProductSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ message: result.error.flatten().fieldErrors }, { status: 400 })
  }

  const existingProduct = await getProductById(productId)
  if (!existingProduct) {
    return Response.json({ message: "Product not found" }, { status: 404 })
  }

  const updatedProduct = await updateProduct(productId, result.data)

  return Response.json(updatedProduct, { status: 200 })
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    return Response.json({
      message: "Invalid Product Id"
    }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return Response.json({
      message: "Authentication is required"
    }, { status: 401 });
  }

  if (!hasPermission(user.UserRole, "products:delete")) {
    return Response.json({
      message: "User does not have permission"
    }, { status: 403 });
  }
   
  await deleteProduct(productId);

  return Response.json({
    message: "Product deleted successfully"
  }, { status: 200 });
}