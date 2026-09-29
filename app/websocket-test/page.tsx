"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

type CreatedRoom = {
  id: string;
  name: string;
};

export default function WebSocketTestPage() {
  const socketRef = useRef<WebSocket | null>(null);

  // Always holds the room we most recently asked to join, so the socket
  // listener (created once) can ignore messages meant for other rooms.
  const activeRoomRef = useRef<string>("");

  const [connected, setConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = useState<CreatedRoom[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
      setLogs((previous) => [...previous, "Connected to WebSocket server"]);
    });

    socket.addEventListener("message", (event) => {
      setLogs((previous) => [...previous, `Received: ${event.data}`]);

      try {
        const payload = JSON.parse(event.data);

        if (payload.event === "identity") {
          setCurrentUserId(payload.data.userId);
          return;
        }

        if (payload.event === "room.error") {
          setLogs((previous) => [
            ...previous,
            `Error: ${payload.data.message}`,
          ]);
          return;
        }

        if (payload.event === "room.history") {
          if (payload.data.roomId !== activeRoomRef.current) {
            return;
          }

          const history: ChatMessage[] = payload.data.messages.map(
            (msg: {
              id: string;
              userId: number;
              message: string;
              createdAt: string;
            }) => ({
              id: msg.id,
              senderId: String(msg.userId),
              text: msg.message,
              timestamp: new Date(msg.createdAt).toLocaleTimeString(),
            })
          );

          // Replace, rather than append: this is a fresh room's
          // full history, not new messages arriving live.
          setMessages(history);
          return;
        }

        if (payload.event === "room.message") {
          if (payload.data.roomId !== activeRoomRef.current) {
            return;
          }

          const senderId = payload.data.userId;
          const text = payload.data.message;
          const createdAt = payload.data.createdAt;

          setMessages((prev) => [
            ...prev,
            {
              id: payload.data.id ?? Math.random().toString(),
              senderId: String(senderId),
              text,
              timestamp: createdAt
                ? new Date(createdAt).toLocaleTimeString()
                : new Date().toLocaleTimeString(),
            },
          ]);
        }
      } catch {
        // Ignore non-JSON or non-chat messages
      }
    });

    socket.addEventListener("close", () => {
      setConnected(false);
      setLogs((previous) => [...previous, "Disconnected"]);
    });

    return () => {
      socket.close();
    };
  }, []);

  function joinRoom(id: string = roomId) {
    const socket = socketRef.current;
    const targetRoomId = id.trim();

    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !targetRoomId
    ) {
      return;
    }

    activeRoomRef.current = targetRoomId;
    setRoomId(targetRoomId);
    setMessages([]);

    socket.send(
      JSON.stringify({
        event: "room.join",
        data: { roomId: targetRoomId },
      })
    );

    setLogs((previous) => [...previous, `Joining room: ${targetRoomId}`]);
  }

  function sendRoomMessage() {
    const socket = socketRef.current;

    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !message.trim() ||
      !activeRoomRef.current
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        event: "room.message",
        data: {
          roomId: activeRoomRef.current,
          message,
        },
      })
    );

    setMessage("");
  }

  async function createRoom() {
    const name = newRoomName.trim();

    if (!name || creating) {
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        const fieldErrors = json.error?.details?.name as string[] | undefined;

        setCreateError(
          fieldErrors?.[0] ?? json.error?.message ?? "Could not create room"
        );
        return;
      }

      // Adjust this line if your successResponse() uses a different shape
      const room = json.data ?? json;

      setCreatedRooms((previous) => [
        { id: room.id, name: room.name },
        ...previous,
      ]);
      setNewRoomName("");
      setLogs((previous) => [
        ...previous,
        `Created room "${room.name}" (${room.id})`,
      ]);

      // The creator is already a RoomMember, so joining is allowed
      joinRoom(room.id);
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <h1 className="text-2xl font-bold">WebSocket Room Test</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-6">
            {/* Create Room */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">
                Create Room
              </h2>
              <div className="flex gap-2">
                <input
                  value={newRoomName}
                  onChange={(event) => setNewRoomName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      createRoom();
                    }
                  }}
                  placeholder="Room name"
                  maxLength={60}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <button
                  onClick={createRoom}
                  disabled={creating || !newRoomName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>

              {createError && (
                <p className="mt-2 text-sm text-red-600">{createError}</p>
              )}

              {createdRooms.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {createdRooms.map((room) => (
                    <li key={room.id}>
                      <button
                        onClick={() => joinRoom(room.id)}
                        className="w-full text-left px-3 py-1.5 rounded-md text-sm text-slate-800 hover:bg-slate-200 transition"
                      >
                        {room.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {room.id}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Join Room */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">
                Join Room
              </h2>
              <div className="flex gap-2">
                <input
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                  placeholder="Room ID"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <button
                  onClick={() => joinRoom()}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col h-80">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">Chat</h2>
              <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-white rounded border border-slate-200 mb-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === String(currentUserId);
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          isMe
                            ? "bg-slate-200 text-slate-900 rounded-br-none"
                            : "bg-blue-600 text-white rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-xs text-slate-400 mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      sendRoomMessage();
                    }
                  }}
                  placeholder="Hello room"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <button
                  onClick={sendRoomMessage}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2 text-white font-sans">
              Raw Logs
            </h2>
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Waiting for logs...</p>
            ) : (
              logs.map((log, index) => (
                <p key={index} className="border-b border-slate-800 py-1">
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}