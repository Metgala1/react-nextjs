import { getExternalPost } from "@/sevices/jsonplaceholder.service";
import { handleApiError } from "@/lib/handle-api-error";
import { successResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await getExternalPost(Number(id));

    return successResponse(post);
  } catch (error) {
    return handleApiError(error);
  }
}