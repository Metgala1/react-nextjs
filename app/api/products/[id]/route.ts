import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { errorResponse } from "@/lib/api-response";
import { successResponse } from "@/lib/api-response";

import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/sevices/product.service";
import { updateProductSchema } from "@/validation/product";
import { z } from "zod";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export type UpdateProduct = z.infer<typeof updateProductSchema>;

export async function GET(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return errorResponse(
      "Invalid product ID",
      "INVALID_PRODUCT_ID",
      400
    );
  }

  const product = await getProductById(productId);

  if (!product) {
    return errorResponse(
      "Product not found",
      "PRODUCT_NOT_FOUND",
      404
    );
  }

  return successResponse(product);
}

export async function PATCH(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return errorResponse(
      "Invalid product ID",
      "INVALID_PRODUCT_ID",
      400
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return errorResponse(
      "Authentication required",
      "UNAUTHENTICATED",
      401
    );
  }

  if (!hasPermission(user.UserRole, "products:update")) {
    return errorResponse(
      "User does not have permission",
      "FORBIDDEN",
      403
    );
  }

  const body = await request.json();

  const result = updateProductSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "Validation failed",
      "VALIDATION_ERROR",
      400,
      result.error.flatten().fieldErrors
    );
  }

  const existingProduct = await getProductById(productId);

  if (!existingProduct) {
    return errorResponse(
      "Product not found",
      "PRODUCT_NOT_FOUND",
      404
    );
  }

  const updatedProduct = await updateProduct(
    productId,
    result.data
  );

  return successResponse(updatedProduct);
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return errorResponse(
      "Invalid product ID",
      "INVALID_PRODUCT_ID",
      400
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return errorResponse(
      "Authentication required",
      "UNAUTHENTICATED",
      401
    );
  }

  if (!hasPermission(user.UserRole, "products:delete")) {
    return errorResponse(
      "User does not have permission",
      "FORBIDDEN",
      403
    );
  }

  const existingProduct = await getProductById(productId);

  if (!existingProduct) {
    return errorResponse(
      "Product not found",
      "PRODUCT_NOT_FOUND",
      404
    );
  }

  const deletedProduct = await deleteProduct(productId);

  return successResponse({
    message: "Product deleted successfully",
    product: deletedProduct,
  });
}
