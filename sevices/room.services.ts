import {prisma} from "@/lib/prisma"
import { createRoomSchema } from "@/schema/websocket.schema";

export async function createRoom(name: string, ownerId: number) {
  const parsedName = createRoomSchema.safeParse({ name })

  if (!parsedName.success) {
    throw new Error("Room name is required");
  }

  const trimmedName = parsedName.data.name

  return prisma.$transaction(async (tx) => {
    const room = await tx.room.create({
      data: {
        name: trimmedName,
        ownerId

      }
    });

    await tx.roomMember.create({
      data: {
        roomId: room.id,
        userId: room.ownerId
      }
    })

    return room
  })
}