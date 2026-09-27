import z from "zod";

const roomJoinSchema = z.object({
    event: z.literal("room.join"),
    data: z.object({
        roomId: z.string().min(1)
    })
})

const roomMessageSchema = z.object({
    event: z.literal("room.message"),
    data: z.object({
        roomId: z.string().min(1),
        message: z.string().min(1).max(1000)
    })
})

export const websocketMessageSchema = z.discriminatedUnion(
    "event",
    [roomJoinSchema, roomMessageSchema]
);

export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;