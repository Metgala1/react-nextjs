import { UserRole } from "@/app/generated/prisma/enums";
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

export async function canManageRoom(
    userId: number,
    roomId: string,
    role: UserRole
) {
    if(role === "ADMIN") {
        return true
    }

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            ownerId: userId
        },
        select: {
            id: true
        }
    })

    return room !== null
}

export async function addRoomMember(
   roomId: string,
   targetUserId: number
) {
    return  prisma.roomMember.create({
        data: {
            roomId,
            userId: targetUserId
        }
    })
}

export async function removeRoomMember(
    roomId: string,
    targetUserId: number
) {
    await prisma.roomMember.delete({
        where: {
            userId_roomId: {
                userId: targetUserId,
                roomId
            }
        }
    })

}

export async function getRoomMembers(
  roomId: string
) {
  return prisma.roomMember.findMany({
    where: {
      roomId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          UserRole: true,
        },
      },
    },
  });
}