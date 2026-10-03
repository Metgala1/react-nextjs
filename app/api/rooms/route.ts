import { NextResponse } from "next/server";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/handle-api-error";
import { hasPermission } from "@/lib/permissions";
import { createRoomSchema } from "@/schema/websocket.schema";
import { createRoom, getUserRooms  } from "@/sevices/room.services";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Authentication required",
                        code: "UNAUTHENTICATED",
                    },
                },
                { status: 401 }
            );
        }

        if (!hasPermission(user.UserRole, "room:create")) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "You do not have permission to perform this action",
                        code: "UNAUTHORIZED_ACTION",
                    },
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const result = createRoomSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Validation failed",
                        code: "VALIDATION_ERROR",
                        details: result.error.flatten().fieldErrors,
                    },
                },
                { status: 400 }
            );
        }

        const room = await createRoom(
            result.data.name,
            user.id 
        );

        return successResponse(room, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(
    request: Request
) {
    try{
        const session = await requireAuth();

        const rooms = await getUserRooms(session.user.id)

        return successResponse(rooms, 200)

    }catch(error) {
        return handleApiError(error)
    }

}