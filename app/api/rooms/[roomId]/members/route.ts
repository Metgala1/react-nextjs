import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/handle-api-error";
import { successResponse } from "@/lib/api-response";
import { getRoomMembers } from "@/sevices/room.services";

export async function GET(
    _request: Request,
    {
        params
    }: {
        params: Promise<{
            roomId: string;
        }>;
    }
) {
    try {
        const session = await requireAuth();

        const { roomId } = await params;

        if (!roomId.trim()) {
            throw new AppError(
                "Invalid room ID",
                400,
                "INVALID_ROOM_ID"
            );
        }

        const members = await getRoomMembers(
            roomId,
            session.user.id,
            session.user.UserRole
        );

        return successResponse(members);
    } catch (error) {
        return handleApiError(error);
    }
}