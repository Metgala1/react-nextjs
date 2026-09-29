import { getRoomMembers } from "@/sevices/room.services";
import { successResponse } from "@/lib/api-response";


export async function GET(
    request: Request,
    roomId: Promise<{roomId: string}>
) {
    const { roomId: id } = await roomId
    const members = await getRoomMembers(id)

    return successResponse(members, 200)

}