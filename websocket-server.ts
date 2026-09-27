import { createServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { websocketMessageSchema } from "./schema/websocket.schema";

type UserRole = "CUSTOMER" | "ADMIN";

type SocketState = {
  userId: number;
  role: UserRole;
  rooms: Set<string>;
};

const server = createServer();

const wss = new WebSocketServer({
  noServer: true,
});

const socketStates = new Map<WebSocket, SocketState>();

const rooms = new Map<string, Set<WebSocket>>();

const ROOM_HISTORY_LIMIT = 50;

console.log("WebSocket server running on ws://localhost:3001");

async function authenticateSocket(
  request: IncomingMessage
): Promise<SocketState | null> {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [name, ...value] = cookie.trim().split("=");

      return [
        name,
        decodeURIComponent(value.join("=")),
      ];
    })
  );

  const sessionId = cookies.session;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          UserRole: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return {
    userId: session.user.id,
    role: session.user.UserRole,
    rooms: new Set(),
  };
}

// async function authorizeRoomAccess(
//   state: SocketState,
//   roomId: string
// ): Promise<boolean> {
//   if (state.role === "ADMIN") {
//     return true;
//   }

//   const orderId = Number(
//     roomId.replace("order-", "")
//   );

//   if (!Number.isInteger(orderId)) {
//     return false;
//   }

// //   const order = await prisma.order.findFirst({
// //     where: {
// //       id: orderId,
// //       userId: state.userId,
// //     },
// //     select: {
// //       id: true,
// //     },
// //   });

//   return order == null;
// }

function joinRoom(socket: WebSocket, roomId: string) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  rooms.get(roomId)!.add(socket);

  const state = socketStates.get(socket);

  if (state) {
    state.rooms.add(roomId);
  }
}

function leaveRoom(socket: WebSocket, roomId: string) {
  const room = rooms.get(roomId);

  if (room) {
    room.delete(socket);

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }

  const state = socketStates.get(socket);

  if (state) {
    state.rooms.delete(roomId);
  }
}

function broadcastToRoom(
  roomId: string,
  message: string
) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/*
 * Loads the most recent messages for a room, oldest first,
 * so the client can render them top-to-bottom like a normal
 * chat history.
 */
async function loadRoomHistory(roomId: string) {
  const messages = await prisma.message.findMany({
    where: {
      roomId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: ROOM_HISTORY_LIMIT,
    select: {
      id: true,
      text: true,
      senderId: true,
      createdAt: true,
    },
  });

  return messages.reverse();
}

wss.on("connection", (socket) => {
  const state = socketStates.get(socket);

  if (!state) {
    socket.close();
    return;
  }

  console.log(
    `User ${state.userId} connected with role ${state.role}`
  );

  // Tell this browser its own real, server-verified user ID
  socket.send(
    JSON.stringify({
      event: "identity",
      data: {
        userId: state.userId,
      },
    })
  );

  socket.on("message", (message) => {
    (async () => {
      try {
        const rawPayload = JSON.parse(message.toString());

        const result = websocketMessageSchema.safeParse(rawPayload);

        if (!result.success) {
          socket.send(
            JSON.stringify({
              event: "error",
              data: {
                message: "Invalid message format",
              },
            })
          );
          return;
        }

        const payload = result.data;

        if (payload.event === "room.join") {
          const roomId = payload.data.roomId;

          joinRoom(socket, roomId);

          socket.send(
            JSON.stringify({
              event: "room.joined",
              data: {
                roomId,
              },
            })
          );

          // Send this user the room's recent history, just to them
          const history = await loadRoomHistory(roomId);

          socket.send(
            JSON.stringify({
              event: "room.history",
              data: {
                roomId,
                messages: history.map((msg) => ({
                  id: msg.id,
                  message: msg.text,
                  userId: msg.senderId,
                  createdAt: msg.createdAt,
                })),
              },
            })
          );
        }

        if (payload.event === "room.message") {
          const roomId = payload.data.roomId;
          const senderState = socketStates.get(socket);

          if (!senderState) {
            return;
          }

          // Save first, so the message is never lost even if
          // nobody else is online to receive the live broadcast.
          const saved = await prisma.message.create({
            data: {
              roomId,
              text: payload.data.message,
              senderId: senderState.userId,
            },
          });

          broadcastToRoom(
            roomId,
            JSON.stringify({
              event: "room.message",
              data: {
                id: saved.id,
                message: saved.text,
                userId: saved.senderId,
                createdAt: saved.createdAt,
              },
            })
          );
        }
      } catch (error) {
        console.error("Failed to handle message:", error);

        socket.send(
          JSON.stringify({
            event: "error",
            data: {
              message: "Invalid message",
            },
          })
        );
      }
    })();
  });

  socket.on("close", () => {
    const state = socketStates.get(socket);

    if (!state) {
      return;
    }

    const joinedRooms = [...state.rooms];

    joinedRooms.forEach((roomId) => {
      leaveRoom(socket, roomId);
    });

    socketStates.delete(socket);

    console.log(
      `User ${state.userId} disconnected`
    );
  });
});

server.on("upgrade", async (request, socket, head) => {
  try {
    const state = await authenticateSocket(request);

    if (!state) {
      socket.write(
        "HTTP/1.1 401 Unauthorized\r\n" +
          "Connection: close\r\n" +
          "\r\n"
      );

      socket.destroy();

      return;
    }

    wss.handleUpgrade(
      request,
      socket,
      head,
      (ws) => {
        socketStates.set(ws, state);

        wss.emit("connection", ws, request);
      }
    );
  } catch (error) {
    console.error(
      "WebSocket authentication failed:",
      error
    );

    socket.write(
      "HTTP/1.1 500 Internal Server Error\r\n" +
        "Connection: close\r\n" +
        "\r\n"
    );

    socket.destroy();
  }
});

server.listen(3001, () => {
  console.log(
    "WebSocket server listening on http://localhost:3001"
  );
});