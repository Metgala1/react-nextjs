import { prisma } from "@/lib/prisma"

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

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

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