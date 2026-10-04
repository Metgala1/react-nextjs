import { createServer, IncomingMessage } from "http";
import type { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { websocketMessageSchema } from "./schema/websocket.schema";
import { startRedisSubscriber } from "./websocket/redis-subscriber";

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const PORT = Number(process.env.WS_PORT ?? 3001);
const ROOM_HISTORY_LIMIT = 50;
const MAX_PAYLOAD_BYTES = 16 * 1024;
const HEARTBEAT_INTERVAL_MS = 30_000;

// Comma-separated list, e.g. "http://localhost:3000,https://app.example.com".
// Leave empty to skip the check (dev only).
const ALLOWED_ORIGINS = (process.env.WS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/* -------------------------------------------------------------------------- */
/* Types & state                                                              */
/* -------------------------------------------------------------------------- */

type UserRole = "CUSTOMER" | "ADMIN";

type SocketState = {
  userId: number;
  role: UserRole;
  rooms: Set<string>;
};

// socket -> who is on the other end
const socketStates = new Map<WebSocket, SocketState>();

// roomId -> every socket currently listening to that room
const rooms = new Map<string, Set<WebSocket>>();

// One active or ringing call per authenticated user in this process.
const callPartners = new Map<number, number>();

// sockets that answered the last ping
const alive = new WeakSet<WebSocket>();

const server = createServer();

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: MAX_PAYLOAD_BYTES,
});

/* -------------------------------------------------------------------------- */
/* Sending helpers                                                            */
/* -------------------------------------------------------------------------- */

function send(socket: WebSocket, event: string, data: unknown) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
}

function sendError(socket: WebSocket, message: string, roomId?: string) {
  send(socket, "room.error", { roomId, message });
}

function broadcastToRoom(roomId: string, event: string, data: unknown) {
  const sockets = rooms.get(roomId);

  if (!sockets) {
    return;
  }

  // Serialize once, not once per client
  const payload = JSON.stringify({ event, data });

  for (const client of sockets) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function notifyUserAddedToRoom(
    userId: number,
    roomId: string
) {
    for (const [socket, state] of socketStates) {
        if (state.userId !== userId) {
            continue;
        }

        send(socket, "room.added", {
            roomId,
        });
    }
}

/* -------------------------------------------------------------------------- */
/* Video call signaling                                                       */
/* -------------------------------------------------------------------------- */

type CallPayload = {
  type: "call.initiate" | "call.accept" | "call.reject" | "call.offer" |
    "call.answer" | "ice.candidate" | "call.end";
  targetUserId?: number | string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

function sendCall(socket: WebSocket, type: string, data: Record<string, unknown> = {}) {
  if (socket.readyState === WebSocket.OPEN) {
    // VideoCall.tsx uses a flat { type, ... } protocol. Room messages keep
    // their existing { event, data } envelope.
    socket.send(JSON.stringify({ type, ...data }));
  }
}

function sendCallError(socket: WebSocket, message: string) {
  sendCall(socket, "call.error", { message });
}

function socketsForUser(userId: number): WebSocket[] {
  return [...socketStates.entries()]
    .filter(([socket, state]) => state.userId === userId && socket.readyState === WebSocket.OPEN)
    .map(([socket]) => socket);
}

function sendCallToUser(userId: number, type: string, fromUserId: number, data: Record<string, unknown> = {}) {
  for (const socket of socketsForUser(userId)) {
    // String IDs match the browser's target ID input and avoid number/string
    // comparison mismatches in the client.
    sendCall(socket, type, { ...data, fromUserId: String(fromUserId) });
  }
}

function parseTargetUserId(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isCallParticipant(userId: number, targetUserId: number): boolean {
  return callPartners.get(userId) === targetUserId && callPartners.get(targetUserId) === userId;
}

function endCallFor(userId: number, notifyOther: boolean) {
  const otherUserId = callPartners.get(userId);
  if (otherUserId === undefined) return;
  callPartners.delete(userId);
  callPartners.delete(otherUserId);
  if (notifyOther) sendCallToUser(otherUserId, "call.end", userId);
}

function handleCallMessage(socket: WebSocket, state: SocketState, payload: CallPayload): boolean {
  if (!payload || typeof payload !== "object" || typeof payload.type !== "string" || !payload.type.startsWith("call.") && payload.type !== "ice.candidate") {
    return false;
  }
  const callTypes = ["call.initiate", "call.accept", "call.reject", "call.offer", "call.answer", "ice.candidate", "call.end"];
  if (!callTypes.includes(payload.type)) {
    sendCallError(socket, "Unknown call signaling message");
    return true;
  }
  const targetUserId = parseTargetUserId(payload.targetUserId);
  if (targetUserId === null || targetUserId === state.userId) {
    sendCallError(socket, "A valid other targetUserId is required");
    return true;
  }
  if (socketsForUser(targetUserId).length === 0) {
    sendCallError(socket, "That user is not connected");
    return true;
  }

  if (payload.type === "call.initiate") {
    if (callPartners.has(state.userId) || callPartners.has(targetUserId)) {
      sendCallError(socket, "One of the users is already in a call");
      return true;
    }
    callPartners.set(state.userId, targetUserId);
    callPartners.set(targetUserId, state.userId);
    sendCallToUser(targetUserId, "call.incoming", state.userId);
    return true;
  }

  if (!isCallParticipant(state.userId, targetUserId)) {
    sendCallError(socket, "No active call exists with that user");
    return true;
  }

  if (payload.type === "call.end" || payload.type === "call.reject") {
    const type = payload.type;
    callPartners.delete(state.userId);
    callPartners.delete(targetUserId);
    sendCallToUser(targetUserId, type, state.userId);
    return true;
  }

  if (payload.type === "call.accept") {
    sendCallToUser(targetUserId, payload.type, state.userId);
    return true;
  }

  if (payload.type === "call.offer" && payload.offer && typeof payload.offer === "object") {
    sendCallToUser(targetUserId, payload.type, state.userId, { offer: payload.offer });
    return true;
  }
  if (payload.type === "call.answer" && payload.answer && typeof payload.answer === "object") {
    sendCallToUser(targetUserId, payload.type, state.userId, { answer: payload.answer });
    return true;
  }
  if (payload.type === "ice.candidate" && payload.candidate && typeof payload.candidate === "object") {
    sendCallToUser(targetUserId, payload.type, state.userId, { candidate: payload.candidate });
    return true;
  }

  sendCallError(socket, `Invalid payload for ${payload.type}`);
  return true;
}
/* -------------------------------------------------------------------------- */
/* Room membership (in-memory)                                                */
/* -------------------------------------------------------------------------- */


function joinRoom(socket: WebSocket, roomId: string) {
  let sockets = rooms.get(roomId);

  if (!sockets) {
    sockets = new Set();
    rooms.set(roomId, sockets);
  }

  sockets.add(socket);
  socketStates.get(socket)?.rooms.add(roomId);
}

function leaveRoom(socket: WebSocket, roomId: string) {
  const sockets = rooms.get(roomId);

  if (sockets) {
    sockets.delete(socket);

    if (sockets.size === 0) {
      rooms.delete(roomId);
    }
  }

  socketStates.get(socket)?.rooms.delete(roomId);
}

/**
 * Kick every live connection of a user out of a room and tell them.
 * Note: this only affects the process it runs in. If your Next.js API
 * needs to trigger it, expose it through an internal endpoint or a
 * pub/sub channel — the API can't call it directly.
 */
export function removeUserFromRoom(userId: number, roomId: string) {
  for (const [socket, state] of socketStates) {
    if (state.userId !== userId || !state.rooms.has(roomId)) {
      continue;
    }

    send(socket, "room.removed", { roomId });
    leaveRoom(socket, roomId);
  }
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");

    if (!name) {
      continue;
    }

    const raw = rest.join("=");

    try {
      cookies[name] = decodeURIComponent(raw);
    } catch {
      // Malformed encoding: keep the raw value rather than failing the upgrade
      cookies[name] = raw;
    }
  }

  return cookies;
}

async function authenticateSocket(
  request: IncomingMessage
): Promise<SocketState | null> {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const sessionId = parseCookies(cookieHeader).session;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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
    // deleteMany doesn't throw if another request already removed it
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return {
    userId: session.user.id,
    role: session.user.UserRole,
    rooms: new Set(),
  };
}

/*
 * Can this user enter this room?
 *
 * - Admins can enter any room that exists.
 * - Everyone else needs a RoomMember row linking them to it.
 *
 * Nonexistent rooms and rooms you're not in give the same
 * answer (false), so nobody can probe which rooms exist.
 */
async function authorizeRoomAccess(
  roomId: string,
  state: SocketState
): Promise<boolean> {
  if (state.role === "ADMIN") {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    return room !== null;
  }

  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: state.userId,
        roomId,
      },
    },
    select: { id: true },
  });

  return membership !== null;
}

function rejectUpgrade(socket: Duplex, status: string) {
  socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Most recent messages for a room, oldest first,
 * so the client can render them top-to-bottom.
 */
async function loadRoomHistory(roomId: string) {
  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
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

/* -------------------------------------------------------------------------- */
/* Event handlers                                                             */
/* -------------------------------------------------------------------------- */

async function handleJoin(
  socket: WebSocket,
  state: SocketState,
  roomId: string
) {
  if (!(await authorizeRoomAccess(roomId, state))) {
    sendError(socket, "You don't have access to this room", roomId);
    return;
  }

  // The user may have disconnected while we were checking
  // the database. Don't add a dead socket to the room.
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  joinRoom(socket, roomId);
  send(socket, "room.joined", { roomId });

  // Send this user the room's recent history, just to them.
  // Clients should de-duplicate by message id: a live message can
  // arrive between the join and the history query.
  const history = await loadRoomHistory(roomId);

  send(socket, "room.history", {
    roomId,
    messages: history.map((msg) => ({
      id: msg.id,
      message: msg.text,
      userId: msg.senderId,
      createdAt: msg.createdAt,
    })),
  });
}

async function handleMessage(
  socket: WebSocket,
  state: SocketState,
  roomId: string,
  text: string
) {
  // Only people who successfully joined (and so passed
  // the access check) can send into a room.
  if (!state.rooms.has(roomId)) {
    sendError(socket, "You have not joined this room", roomId);
    return;
  }

  // Save first, so the message is never lost even if
  // nobody else is online to receive the live broadcast.
  const saved = await prisma.message.create({
    data: {
      roomId,
      text,
      senderId: state.userId,
    },
  });

  broadcastToRoom(roomId, "room.message", {
    id: saved.id,
    roomId, // lets the client tell rooms apart
    message: saved.text,
    userId: saved.senderId,
    createdAt: saved.createdAt,
  });
}

async function handleIncoming(
  socket: WebSocket,
  state: SocketState,
  raw: string
) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      sendError(socket, "Invalid message format");
      return;
    }

    const object = parsed as Record<string, unknown>;
    // VideoCall.tsx sends flat typed messages; route these independently from
    // the existing room event envelope and Zod schema.
    if (typeof object.type === "string") {
      const handled = handleCallMessage(socket, state, object as CallPayload);
      if (handled) return;
      sendCallError(socket, "Unknown signaling message type");
      return;
    }

    const result = websocketMessageSchema.safeParse(parsed);
    if (!result.success) {
      sendError(socket, "Invalid message format");
      return;
    }

    const payload = result.data;
    switch (payload.event) {
      case "room.join":
        await handleJoin(socket, state, payload.data.roomId);
        break;
      case "room.message":
        await handleMessage(socket, state, payload.data.roomId, payload.data.message);
        break;
    }
  } catch (error) {
    console.error("Failed to handle message:", error);
    sendError(socket, error instanceof SyntaxError ? "Invalid message" : "Something went wrong");
  }
}

/* -------------------------------------------------------------------------- */
/* Connection lifecycle                                                       */
/* -------------------------------------------------------------------------- */

wss.on("connection", (socket) => {
  const state = socketStates.get(socket);

  if (!state) {
    socket.close();
    return;
  }

  console.log(`User ${state.userId} connected with role ${state.role}`);

  alive.add(socket);
  socket.on("pong", () => alive.add(socket));

  // Tell this browser its own real, server-verified user ID
  send(socket, "identity", { userId: state.userId });

  socket.on("message", (data) => {
    void handleIncoming(socket, state, data.toString());
  });

  socket.on("error", (error) => {
    console.error(`Socket error for user ${state.userId}:`, error);
  });

  socket.on("close", () => {
    // Calls are process-local; notify the other user if their peer vanished.
    endCallFor(state.userId, true);
    for (const roomId of [...state.rooms]) {
      leaveRoom(socket, roomId);
    }

    socketStates.delete(socket);
    console.log(`User ${state.userId} disconnected`);
  });
});

// Drop connections that stopped answering pings (closed laptops, dead networks)
const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (!alive.has(socket)) {
      socket.terminate();
      continue;
    }

    alive.delete(socket);
    socket.ping();
  }
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeat));

server.on("upgrade", async (request, socket, head) => {
  try {
    // Cookies ride along on cross-site WebSocket handshakes, so check
    // where the request came from before trusting the session.
    if (
      ALLOWED_ORIGINS.length > 0 &&
      !ALLOWED_ORIGINS.includes(request.headers.origin ?? "")
    ) {
      rejectUpgrade(socket, "403 Forbidden");
      return;
    }

    const state = await authenticateSocket(request);

    if (!state) {
      rejectUpgrade(socket, "401 Unauthorized");
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      socketStates.set(ws, state);
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    console.error("WebSocket authentication failed:", error);
    rejectUpgrade(socket, "500 Internal Server Error");
  }
});

void startRedisSubscriber((message) => {
  try {
    const event = JSON.parse(message);

    if (event.type === "ROOM_MEMBER_REMOVED") {
      removeUserFromRoom(
        event.userId,
        event.roomId
      );
     
    }

    if(event.type === "ROOM_MEMBER_ADDED") {
      notifyUserAddedToRoom(event.userId, event.roomId)

    }

    console.log("Redis Event Received:", event.userId, event.roomId);
  } catch (error) {
    console.error("Failed to handle Redis event:", error);
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});