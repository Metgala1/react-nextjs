// lib/supabase/product-images.ts
import { createAdminClient } from "./admin";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export type UploadProductImageResult =
  | { success: true; path: string }
  | { success: false; message: string };


export async function uploadProductImage(
  image: File
): Promise<UploadProductImageResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return { success: false, message: "Only JPG, PNG, WebP images are allowed" };
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return { success: false, message: "Image must be smaller than 5mb" };
  }

  const extension = image.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `products/${fileName}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("products")
    .upload(filePath, image, {
      contentType: image.type,
      upsert: false,
    });

  if (error) {
    console.error(error);
    return { success: false, message: "Failed to upload product image" };
  }

  return { success: true, path: data.path };
}

export async function deleteProductImage(
  path: string | null | undefined
): Promise<void> {
  if (!path || path.startsWith("http")) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("products").remove([path]);

  if (error) {
    console.error("Failed to delete product image:", error);
  }
}