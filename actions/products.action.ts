// actions/products.action.ts
"use server";
import { addProduct, updateProducts } from "@/sevices/product.service";
import { createProductSchema, updateProductSchema } from "@/validation/product";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase/product-images";

// Small shared helper so both actions parse specs the same way.
function parseSpecs(formData: FormData): string[] {
  const specInput = (formData.get("specInput") as string) || "";
  return specInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type CreateProductState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    price?: string[];
    category?: string[];
    rating?: string[];
    reviewsCount?: string[];
    description?: string[];
    specs?: string[];
    image?: string[];
    quantity?: string[];
  };
};

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

export async function createProduct(
  previousState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const specs = parseSpecs(formData);
  const imageValue = formData.get("image");

  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  if (!hasPermission(session.user.UserRole, "products:create")) {
    return {
      success: false,
      message: "You don't have permission to create products",
    };
  }

  // Image is optional on create: if a File was provided, upload it and store
  // the resulting bucket path. Otherwise fall back to the default external
  // placeholder URL.
  let imagePath: string = DEFAULT_PRODUCT_IMAGE;
  let uploadedPath: string | null = null;

  if (imageValue instanceof File && imageValue.size > 0) {
    const uploadResult = await uploadProductImage(imageValue);

    if (!uploadResult.success) {
      return {
        success: false,
        message: uploadResult.message,
        errors: { image: [uploadResult.message] },
      };
    }

    imagePath = uploadResult.path;
    uploadedPath = uploadResult.path;
  } else if (typeof imageValue === "string" && imageValue.length > 0) {
    imagePath = imageValue;
  }

  const result = createProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    category: formData.get("category"),
    rating: formData.get("rating"),
    reviewsCount: formData.get("reviewsCount"),
    description: formData.get("description"),
    specs: specs,
    image: imagePath,
    quantity: formData.get("quantity") || 0,
  });

  if (!result.success) {
    // Only clean up if we actually uploaded a new file this run.
    if (uploadedPath) {
      await deleteProductImage(uploadedPath);
    }
    return {
      success: false,
      message: "Validation failed. Please check the fields below.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const newProduct = {
      ...result.data,
    };
    await addProduct(newProduct);
  } catch (err) {
    console.error(err);
    if (uploadedPath) {
      await deleteProductImage(uploadedPath);
    }
    return {
      success: false,
      message: "Something went wrong while creating product",
    };
  }

  revalidatePath("/products");
  redirect("/products");
}

export type UpdateProductState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    price?: string[];
    category?: string[];
    rating?: string[];
    reviewsCount?: string[];
    description?: string[];
    specs?: string[];
    image?: string[];
    quantity?: string[];
  };
};

// actions/products.action.ts
export async function updateProduct(
  id: number,
  prevState: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  // --- Validate cheap things first (id, auth, permission) before doing any
  // expensive/side-effecting work like uploading a file to storage. ---
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      message: "Invalid product ID",
    };
  }

  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  if (!hasPermission(session.user.UserRole, "products:update")) {
    return {
      success: false,
      message: "You don't have permission to update products",
    };
  }

  const specs = parseSpecs(formData);
  const image = formData.get("image");

  // A submitted <input type="file"> with nothing selected still sends a
  // File object — just an empty one (size 0, name ""). Treat that the same
  // as "no new image" rather than requiring a re-upload on every edit.
  const hasNewImage = image instanceof File && image.size > 0;

  // Look up the product's current image regardless of whether a new file
  // was uploaded — we need it either to delete (new image case) or to
  // reuse as-is (no new image case).
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  // Default to keeping whatever image is already there.
  let imagePath: string = existingProduct.image;
  let uploadedPath: string | null = null;

  if (hasNewImage) {
    // Delete the old image before uploading the new one.
    await deleteProductImage(existingProduct.image);

    const uploadResult = await uploadProductImage(image);

    if (!uploadResult.success) {
      return {
        success: false,
        message: uploadResult.message,
      };
    }

    imagePath = uploadResult.path;
    uploadedPath = uploadResult.path;
  }

  const result = updateProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    category: formData.get("category"),
    rating: formData.get("rating"),
    reviewsCount: formData.get("reviewsCount"),
    description: formData.get("description"),
    specs: specs,
    image: imagePath,
    quantity: formData.get("quantity"),
  });

  if (!result.success) {
    if (uploadedPath) {
      await deleteProductImage(uploadedPath);
    }

    return {
      success: false,
      message: "Validation failed. Please check the fields below.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;
  const { category, ...productData } = data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        category: {
          connect: { name: category },
        },
      },
    });
  } catch (err) {
    console.error(err);
    if (uploadedPath) {
      await deleteProductImage(uploadedPath);
    }

    return {
      success: false,
      message: "Something went wrong while updating the product",
    };
  }

  revalidatePath(`/products`);
  revalidatePath(`/products/${id}`);

  redirect(`/products/${id}`);
}

export async function deleteProduct(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid product ID");
  }

  const session = await getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  if (!hasPermission(session.user.UserRole, "products:delete")) {
    throw new Error("You don't have permission to delete products");
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  try {
    await prisma.product.delete({
      where: {
        id,
      },
    });
  } catch (err) {
    console.error(err);
    throw new Error("Something went wrong while deleting the product");
  }

  await deleteProductImage(product.image);

  revalidatePath("/products");
  redirect("/products");
}