// actions/products.action.ts
"use server";
import { addProduct, updateProducts } from "@/sevices/product.service";
import { createProductSchema, updateProductSchema } from "@/validation/product";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

  // Image is optional on create: if a File was provided, upload it and use
  // the resulting storage path. Otherwise fall back to the default image.
  // (createProductSchema's `image` field expects a string path/URL here,
  // not a raw File, so we never forward the File itself.)
  let imagePath: string = DEFAULT_PRODUCT_IMAGE;
  let uploadedPath: string | null = null;
  const supabase = await createClient();

  if (imageValue instanceof File && imageValue.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(imageValue.type)) {
      return {
        success: false,
        message: "Only JPG, PNG, WebP images are allowed",
        errors: { image: ["Only JPG, PNG, WebP images are allowed"] },
      };
    }

    if (imageValue.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        message: "Image must be smaller than 5mb",
        errors: { image: ["Image must be smaller than 5mb"] },
      };
    }

    const extension = imageValue.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `products/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, imageValue, {
        contentType: imageValue.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return {
        success: false,
        message: "Failed to upload product image",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(uploadData.path);

    imagePath = publicUrlData.publicUrl;
    uploadedPath = uploadData.path;
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
    if (uploadedPath) {
      await supabase.storage.from("products").remove([uploadedPath]);
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
      await supabase.storage.from("products").remove([uploadedPath]);
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

  if (!(image instanceof File)) {
    return {
      success: false,
      message: "Product image is required",
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return {
      success: false,
      message: "Only JPG, PNG, WebP images are allowed",
    };
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return {
      success: false,
      message: "Image must be smaller than 5mb",
    };
  }

  const extension = image.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `products/${fileName}`;

  const supabase = await createClient();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("products")
    .upload(filePath, image, {
      contentType: image.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(uploadError);

    return {
      success: false,
      message: "Failed to upload product image",
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(uploadData.path);

  const result = updateProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    category: formData.get("category"),
    rating: formData.get("rating"),
    reviewsCount: formData.get("reviewsCount"),
    description: formData.get("description"),
    specs: specs,
    image: publicUrlData.publicUrl,
    quantity: formData.get("quantity"),
  });

  if (!result.success) {
    // Clean up the file we just uploaded since we're not going to use it.
    await supabase.storage.from("products").remove([uploadData.path]);

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
    // Clean up the uploaded file since the DB update failed.
    await supabase.storage.from("products").remove([uploadData.path]);

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

  revalidatePath("/products");
  redirect("/products");
}