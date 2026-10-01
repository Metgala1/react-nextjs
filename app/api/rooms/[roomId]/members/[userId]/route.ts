import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/handle-api-error";
import { successResponse } from "@/lib/api-response";
import {
    canManageRoom,
    removeRoomMember,
    addRoomMember
} from "@/sevices/room.services"
import redis from "@/lib/redis/redis";
import App from "next/app";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function DELETE(
    request: Request,
    {
        params,
    }: {
        params: Promise<{
            roomId: string;
            userId: string;
        }>;
    }
) {
    try {
        const session = await requireAuth();

        const { roomId, userId } = await params;

        const targetUserId = Number(userId);

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            throw new AppError(
                "Invalid user ID",
                400,
                "INVALID_USER_ID"
            );
        }

        const canManage = await canManageRoom(
            session.user.id,
            roomId,
            session.user.UserRole
        );

        if (!canManage) {
            throw new AppError(
                "You do not have permission to manage this room",
                403,
                "FORBIDDEN"
            );
        }

        await removeRoomMember(roomId, targetUserId);

        await redis.publish(
            "room-events",
            JSON.stringify({
                type: "ROOM_MEMBER_REMOVED",
                userId: targetUserId,
                roomId
            })
        )

        return successResponse(
            {
                message: "Room member removed successfully",
            },
            200
        );
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ roomId: string, userId: string }> }
) {
    try {
        const session = await requireAuth()

        const { roomId, userId } = await params

        const targetUserId = Number(userId)

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            throw new AppError(
                "Invalid user ID",
                400,
                "INVALID_USER_ID"
            )
        }

        const canManage = await canManageRoom(
            session.user.id,
            roomId,
            session.user.UserRole,
        )

        if (!canManage) {
            throw new AppError(
                "You do not have permission to manage this room",
                403,
                "FORBIDDEN"
            )
        }
        try {
            await addRoomMember(
                roomId,
                targetUserId
            );
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new AppError(
                    "User is already a member of this room",
                    409,
                    "ROOM_MEMBER_EXISTS"
                );
            }

            throw error;
        }

        await redis.publish(
            "room-events",
            JSON.stringify({
                type: "ROOM_MEMBER_ADDED",
                userId: targetUserId,
                roomId
            })
        )

        return successResponse({
            message: "Room member added successfully"
        },
        201
    )
    } catch (error) {

    }

}