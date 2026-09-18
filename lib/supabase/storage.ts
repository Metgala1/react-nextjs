import { createAdminClient } from "./admin";

export async function getProductImageUrl(imagePath: string) {
    // The default placeholder is stored as a full external URL, not a
    // bucket path — pass it through unchanged instead of trying to
    // resolve it against our own "products" bucket.
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const supabase = createAdminClient();

    const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(imagePath);

    return publicUrl;
}
