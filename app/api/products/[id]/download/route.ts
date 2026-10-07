import { getProductById } from "@/sevices/product.service";
import { errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { getProductImageUrl } from "@/lib/supabase/storage";
import { getCurrentUser } from "@/lib/auth";
import { use } from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if(!user) {
        return errorResponse(
            "Authentication required",
            "UNAUTHORIZED",
            401
        )
    }
    if(user.UserRole !== "ADMIN") {
        return errorResponse(
            "You are not allowed to access this file",
            "FORBIDDEN",
            403
        )
    }
    const { id } = await params;

    const product = await getProductById(Number(id));

    const imageUrl = await getProductImageUrl(product.image);

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return errorResponse(
        "Failed to retrieve image",
        "FAILED_TO_RETRIEVE_IMAGE",
        500
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg"
    const extention = contentType.split("/")[1]
    const safeName = product.name.replace(/[^a-zA-Z0-9-_ ]/g, "");
    const fileName = `${safeName}.${extention}`;


    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}