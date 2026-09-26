"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

export default function WebSocketTestPage() {
  const socketRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

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

        if (payload.event === "room.message") {
          const senderId = payload.data.userId;
          const text = payload.data.message;

          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              senderId: String(senderId),
              text,
              timestamp: new Date().toLocaleTimeString(),
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

  function joinRoom() {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        event: "room.join",
        data: { roomId },
      })
    );

    setLogs((previous) => [...previous, `Joining room: ${roomId}`]);
  }

  function sendRoomMessage() {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !message.trim()) {
      return;
    }

    socket.send(
      JSON.stringify({
        event: "room.message",
        data: {
          roomId,
          message,
        },
      })
    );

    setMessage("");
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
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h2 className="text-lg font-semibold mb-3 text-slate-800">Join Room</h2>
              <div className="flex gap-2">
                <input
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                  placeholder="order-123"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <button
                  onClick={joinRoom}
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
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
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
                      <span className="text-xs text-slate-400 mt-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
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
            <h2 className="text-lg font-semibold mb-2 text-white font-sans">Raw Logs</h2>
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