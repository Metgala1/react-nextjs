"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const MAX_LOGS = 200;
const MAX_RECONNECT_DELAY_MS = 15_000;

type WireMessage = { id: string; userId: number; message: string; createdAt: string };
type ChatMessage = { id: string; senderId: number; text: string; createdAt: string };
type CreatedRoom = { id: string; name: string };
type RoomMember = { userId: number; role?: string };
type Invitation = { roomId: string; roomName?: string };
type ConnectionStatus = "connecting" | "open" | "closed";
type LogEntry = { id: number; text: string };
type ServerEvent =
  | { event: "identity"; data: { userId: number } }
  | { event: "room.joined"; data: { roomId: string } }
  | { event: "room.history"; data: { roomId: string; messages: WireMessage[] } }
  | { event: "room.message"; data: WireMessage & { roomId: string } }
  | { event: "room.added"; data: { roomId: string; userId?: number; memberId?: number; roomName?: string; name?: string } }
  | { event: "room.removed"; data: { roomId: string; userId?: number; memberId?: number } }
  | { event: "room.error"; data: { roomId?: string; message: string } };

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error?: { message?: string; details?: unknown } };

function mergeMessages(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const item of [...a, ...b]) byId.set(item.id, item);
  return [...byId.values()].sort((x, y) => Date.parse(x.createdAt) - Date.parse(y.createdAt));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function toChatMessage(message: WireMessage): ChatMessage {
  return { id: message.id, senderId: message.userId, text: message.message, createdAt: message.createdAt };
}

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function useRoomSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const targetRoomRef = useRef("");
  const logIdRef = useRef(0);
  const userIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [userId, setUserId] = useState<number | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const log = useCallback((text: string) => {
    const stamp = new Date().toLocaleTimeString();
    const entry = { id: logIdRef.current++, text: `${stamp}  ${text}` };
    setLogs(previous => [...previous, entry].slice(-MAX_LOGS));
  }, []);

  const clearActiveRoom = useCallback((message?: string) => {
    targetRoomRef.current = "";
    setJoinedRoomId(null);
    setMessages([]);
    if (message) setNotice(message);
  }, []);

  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function handleServerEvent(payload: ServerEvent) {
      switch (payload.event) {
        case "identity":
          userIdRef.current = payload.data.userId;
          setUserId(payload.data.userId);
          break;
        case "room.joined":
          if (payload.data.roomId === targetRoomRef.current) {
            setJoinedRoomId(payload.data.roomId);
            setRoomError(null);
            setNotice(null);
          }
          break;
        case "room.history":
          if (payload.data.roomId === targetRoomRef.current) {
            setMessages(previous => mergeMessages(previous, payload.data.messages.map(toChatMessage)));
          }
          break;
        case "room.message":
          if (payload.data.roomId === targetRoomRef.current) {
            setMessages(previous => mergeMessages(previous, [toChatMessage(payload.data)]));
          }
          break;
        case "room.added": {
          const targetId = payload.data.userId ?? payload.data.memberId;
          if (targetId === undefined || targetId === userIdRef.current) {
            const roomId = payload.data.roomId;
            const roomName = payload.data.roomName ?? payload.data.name;
            if (roomId) {
              setInvitation(previous => previous?.roomId === roomId ? { roomId, roomName: roomName ?? previous.roomName } : { roomId, roomName });
              setNotice(null);
              log(`Added to room ${roomId}`);
            }
          }
          break;
        }
        case "room.removed": {
          const targetId = payload.data.userId ?? payload.data.memberId;
          if (payload.data.roomId === targetRoomRef.current && (targetId === undefined || targetId === userIdRef.current)) {
            clearActiveRoom("You were removed from this room. The conversation has been cleared.");
            setRoomError(null);
          }
          break;
        }
        case "room.error":
          setRoomError(payload.data.message);
          break;
      }
    }

    function connect() {
      setStatus("connecting");
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;
      socket.addEventListener("open", () => {
        attempt = 0;
        setStatus("open");
        log("Connected to WebSocket server");
        if (targetRoomRef.current) {
          socket.send(JSON.stringify({ event: "room.join", data: { roomId: targetRoomRef.current } }));
          log(`Rejoining room: ${targetRoomRef.current}`);
        }
      });
      socket.addEventListener("message", event => {
        const raw = String(event.data);
        log(`Received: ${raw.length > 300 ? `${raw.slice(0, 300)}…` : raw}`);
        try {
          const parsed: unknown = JSON.parse(raw);
          const record = asRecord(parsed);
          if (record && typeof record.event === "string" && asRecord(record.data)) handleServerEvent(parsed as ServerEvent);
        } catch { /* Ignore malformed or non-JSON frames. */ }
      });
      socket.addEventListener("close", () => {
        setStatus("closed");
        setJoinedRoomId(null);
        if (disposed) return;
        const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY_MS);
        attempt += 1;
        log(`Disconnected. Reconnecting in ${Math.round(delay / 1000)}s (check that you are logged in if this continues)`);
        timer = setTimeout(connect, delay);
      });
      socket.addEventListener("error", () => log("WebSocket connection error"));
    }
    connect();
    return () => { disposed = true; if (timer) clearTimeout(timer); socketRef.current?.close(); };
  }, [clearActiveRoom, log]);

  const joinRoom = useCallback((id: string) => {
    const targetRoomId = id.trim();
    const socket = socketRef.current;
    if (!targetRoomId) return false;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setRoomError("The live connection is unavailable. Try again when it reconnects.");
      log("Can't join: not connected");
      return false;
    }
    targetRoomRef.current = targetRoomId;
    setJoinedRoomId(null);
    setMessages([]);
    setRoomError(null);
    setNotice(null);
    socket.send(JSON.stringify({ event: "room.join", data: { roomId: targetRoomId } }));
    log(`Joining room: ${targetRoomId}`);
    return true;
  }, [log]);

  const sendMessage = useCallback((text: string): boolean => {
    const socket = socketRef.current;
    const trimmed = text.trim();
    if (!socket || socket.readyState !== WebSocket.OPEN || !joinedRoomId || !trimmed) return false;
    socket.send(JSON.stringify({ event: "room.message", data: { roomId: joinedRoomId, message: trimmed } }));
    return true;
  }, [joinedRoomId]);

  return { status, userId, joinedRoomId, messages, logs, roomError, notice, invitation, setInvitation, setNotice, joinRoom, sendMessage, log };
}

const inputClass = "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200 disabled:cursor-not-allowed disabled:bg-stone-100";
const buttonClass = "inline-flex min-h-10 items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-300 disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-45";

export default function StoreFrontRoomsPage() {
  const { status, userId, joinedRoomId, messages, logs, roomError, notice, invitation, setInvitation, joinRoom, sendMessage, log } = useRoomSocket();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [message, setMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = useState<CreatedRoom[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberFeedback, setMemberFeedback] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const membersRequestRef = useRef(0);

  const roomNameById = useMemo(() => new Map(createdRooms.map(room => [room.id, room.name])), [createdRooms]);
  const activeRoomName = joinedRoomId ? roomNameById.get(joinedRoomId) : undefined;
  const invitationName = invitation?.roomName ?? (invitation ? roomNameById.get(invitation.roomId) : undefined);
  const connected = status === "open";
  const canChat = connected && joinedRoomId !== null;

  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [messages]);
  useEffect(() => { if (logScrollRef.current) logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight; }, [logs]);

  const loadMembers = useCallback(async (roomId: string) => {
    const requestId = ++membersRequestRef.current;
    setMembersLoading(true);
    setMembersError(null);
    try {
      const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomId)}/members`, { credentials: "include", cache: "no-store" });
      const json: unknown = await response.json();
      const envelope = asRecord(json);
      if (!response.ok || envelope?.success !== true) {
        const err = asRecord(envelope?.error);
        throw new Error(typeof err?.message === "string" ? err.message : "Could not load room members.");
      }
      const data = envelope.data;
      if (!Array.isArray(data)) throw new Error("The members endpoint returned an unexpected response.");
      const parsed: RoomMember[] = data.flatMap((item): RoomMember[] => {
        const row = asRecord(item);
        const rawId = row?.userId ?? asRecord(row?.user)?.id;
        const numericId = typeof rawId === "number" ? rawId : typeof rawId === "string" && rawId.trim() ? Number(rawId) : NaN;
        if (!Number.isSafeInteger(numericId) || numericId <= 0) return [];
        return [{ userId: numericId, role: typeof row?.role === "string" ? row.role : undefined }];
      });
      if (requestId === membersRequestRef.current) setMembers(parsed);
    } catch (error) {
      if (requestId === membersRequestRef.current) {
        setMembers([]);
        setMembersError(error instanceof Error ? error.message : "Could not load room members.");
      }
    } finally {
      if (requestId === membersRequestRef.current) setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (joinedRoomId) void loadMembers(joinedRoomId);
    else { membersRequestRef.current += 1; setMembers([]); setMembersLoading(false); setMembersError(null); }
  }, [joinedRoomId, loadMembers]);

  // An invitation can arrive before the identity frame. Refresh member data once
  // identity is known; the event itself never changes the requested active room.
  useEffect(() => {
    if (invitation && userId !== null) void loadMembers(invitation.roomId);
  }, [invitation, userId, loadMembers]);

  function handleJoin(id = roomIdInput) {
    const trimmed = id.trim();
    if (joinRoom(trimmed)) setRoomIdInput(trimmed);
  }
  function handleSend(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (sendMessage(message)) setMessage("");
  }

  async function createRoom(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const name = newRoomName.trim();
    if (!name || creating) return;
    setCreating(true); setCreateError(null);
    try {
      const response = await fetch(`${API_URL}/api/rooms`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const json: unknown = await response.json();
      const envelope = asRecord(json);
      if (!response.ok || envelope?.success !== true) {
        const error = asRecord(envelope?.error);
        const details = asRecord(error?.details);
        const nameErrors = details?.name;
        setCreateError(Array.isArray(nameErrors) && typeof nameErrors[0] === "string" ? nameErrors[0] : typeof error?.message === "string" ? error.message : "Could not create room.");
        return;
      }
      const room = asRecord(envelope.data);
      if (typeof room?.id !== "string" || typeof room.name !== "string") throw new Error("The room endpoint returned an unexpected response.");
      const created = { id: room.id, name: room.name };
      setCreatedRooms(previous => [created, ...previous.filter(item => item.id !== created.id)]);
      setNewRoomName("");
      log(`Created room "${created.name}" (${created.id})`);
      handleJoin(created.id);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Network error. Please try again.");
    } finally { setCreating(false); }
  }

  async function updateMember(event: FormEvent<HTMLFormElement>, action: "add" | "remove", targetId = memberUserId) {
    event.preventDefault();
    if (!joinedRoomId || memberBusy) return;
    const parsedId = Number(targetId.trim());
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) { setMemberFeedback("Enter a valid numeric user ID."); return; }
    setMemberBusy(true); setMemberFeedback(null);
    try {
      const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(joinedRoomId)}/members/${parsedId}`, {
        method: action === "add" ? "POST" : "DELETE", credentials: "include",
        ...(action === "add" ? { headers: { "Content-Type": "application/json" } } : {}),
      });
      const json: unknown = await response.json();
      const envelope = asRecord(json);
      if (!response.ok || envelope?.success !== true) {
        const error = asRecord(envelope?.error);
        throw new Error(typeof error?.message === "string" ? error.message : `Could not ${action} room member.`);
      }
      setMemberFeedback(action === "add" ? `User ${parsedId} was added to the room.` : `User ${parsedId} was removed from the room.`);
      setMemberUserId("");
      await loadMembers(joinedRoomId);
      log(`${action === "add" ? "Added" : "Removed"} user ${parsedId} ${action === "add" ? "to" : "from"} room ${joinedRoomId}`);
    } catch (error) {
      setMemberFeedback(error instanceof Error ? error.message : `Could not ${action} room member.`);
    } finally { setMemberBusy(false); }
  }

  const statusLabel = status === "open" ? "Connected" : status === "connecting" ? "Connecting" : "Reconnecting";
  const statusDot = status === "open" ? "bg-emerald-600" : status === "connecting" ? "bg-amber-500" : "bg-stone-400";

  return (
    <main className="min-h-screen bg-[#f6f5f2] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">StoreFront · Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Rooms</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">A focused place to coordinate with the people in your room.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
            <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${statusDot}`} aria-hidden="true" /><span aria-live="polite">{statusLabel}</span></span>
            <span>{userId !== null ? `Signed in as user #${userId}` : "Identifying account…"}</span>
          </div>
        </header>

        {invitation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="invitation-title" aria-describedby="invitation-description" className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-900" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8"><path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v7.5A2.75 2.75 0 0 1 17.25 17H10l-5 3v-5.25A2.75 2.75 0 0 1 4 12V6.75Z" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" strokeLinecap="round"/></svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Room invitation</p>
            <h2 id="invitation-title" className="mt-2 text-xl font-semibold tracking-tight text-stone-900">You’ve been added{invitationName ? ` to ${invitationName}` : " to a room"}</h2>
            <p id="invitation-description" className="mt-2 text-sm leading-6 text-stone-600">Join the room to view its conversation and take part.</p>
            <p className="mt-4 break-all rounded-lg bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600">Room ID: {invitation.roomId}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={secondaryButtonClass} onClick={() => setInvitation(null)}>Dismiss</button>
              <button type="button" className={buttonClass} disabled={!connected} onClick={() => { if (joinRoom(invitation.roomId)) setInvitation(null); }}>{connected ? "Join room" : "Waiting for connection"}</button>
            </div>
          </section>
        </div>}

        {notice && <div role="status" className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"><p>{notice}</p><button type="button" className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700" onClick={() => setNotice(null)}>Dismiss</button></div>}

        {roomError && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{roomError}</div>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-6">
              <form onSubmit={createRoom} className="space-y-3">
                <div><h2 className="text-base font-semibold">Create a room</h2><p className="mt-1 text-sm text-stone-500">Start a new conversation space.</p></div>
                <div className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="new-room-name">Room name</label><input id="new-room-name" value={newRoomName} onChange={event => setNewRoomName(event.target.value)} maxLength={60} placeholder="Name this room" className={inputClass} /><button className={buttonClass} type="submit" disabled={creating || !newRoomName.trim()}>{creating ? "Creating…" : "Create room"}</button></div>
                {createError && <p role="alert" className="text-sm text-red-700">{createError}</p>}
                {createdRooms.length > 0 && <div className="space-y-1 border-t border-stone-100 pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Created in this session</p>{createdRooms.map(room => <button key={room.id} type="button" onClick={() => handleJoin(room.id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"><span className="font-medium">{room.name}</span><span className="max-w-[55%] truncate font-mono text-xs text-stone-500">{room.id}</span></button>)}</div>}
              </form>
              <form onSubmit={event => { event.preventDefault(); handleJoin(); }} className="space-y-3 border-t border-stone-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div><h2 className="text-base font-semibold">Open a room</h2><p className="mt-1 text-sm text-stone-500">Enter a room ID you can access.</p></div>
                <div className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="room-id">Room ID</label><input id="room-id" value={roomIdInput} onChange={event => setRoomIdInput(event.target.value)} placeholder="Paste room ID" className={inputClass} /><button type="submit" className={secondaryButtonClass} disabled={!connected || !roomIdInput.trim()}>Join</button></div>
              </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Conversation</p><h2 className="mt-1 text-lg font-semibold">{joinedRoomId ? activeRoomName ?? "Room conversation" : "No room open"}</h2></div>{joinedRoomId && <span className="max-w-full break-all rounded-md bg-stone-100 px-2.5 py-1 font-mono text-xs text-stone-600">{joinedRoomId}</span>}</div>
              <div ref={chatScrollRef} aria-live="polite" aria-relevant="additions" className="flex h-[min(52vh,520px)] min-h-72 flex-col gap-4 overflow-y-auto bg-[#fcfbf9] p-5 sm:p-6">
                {!joinedRoomId ? <div className="m-auto max-w-sm text-center"><p className="text-sm font-medium text-stone-700">Your conversation will appear here</p><p className="mt-1 text-sm leading-6 text-stone-500">Create a room, open one by ID, or accept an invitation to get started.</p></div> : messages.length === 0 ? <p className="m-auto text-center text-sm text-stone-500">No messages yet. Start the conversation.</p> : messages.map(item => { const isMe = item.senderId === userId; return <article key={item.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] sm:max-w-[72%] ${isMe ? "text-right" : "text-left"}`}><p className="mb-1 text-xs text-stone-500">{isMe ? "You" : `User #${item.senderId}`}</p><div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${isMe ? "rounded-br-md bg-stone-900 text-white" : "rounded-bl-md border border-stone-200 bg-white text-stone-800"}`}>{item.text}</div><time className="mt-1 block text-[11px] text-stone-400">{formatTime(item.createdAt)}</time></div></article>; })}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-stone-200 bg-white p-4 sm:p-5"><label className="sr-only" htmlFor="message">Message</label><input id="message" value={message} onChange={event => setMessage(event.target.value)} disabled={!canChat} placeholder={canChat ? "Write a message…" : "Join a room to send messages"} className={inputClass} /><button type="submit" className={buttonClass} disabled={!canChat || !message.trim()}>Send</button></form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Room details</p><h2 className="mt-1 text-lg font-semibold">Members</h2></div>{joinedRoomId && <button type="button" onClick={() => void loadMembers(joinedRoomId)} className={secondaryButtonClass} disabled={membersLoading}>{membersLoading ? "Loading…" : "Refresh"}</button>}</div>
              {!joinedRoomId ? <p className="mt-5 text-sm leading-6 text-stone-500">Open a room to see its members.</p> : <><div className="mt-4 divide-y divide-stone-100">{membersLoading ? <p className="py-3 text-sm text-stone-500">Loading members…</p> : members.length === 0 && !membersError ? <p className="py-3 text-sm text-stone-500">No member records were returned.</p> : members.map(member => <div key={member.userId} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">User #{member.userId}{member.userId === userId ? " (you)" : ""}</p>{member.role && <p className="mt-0.5 text-xs text-stone-500">{member.role}</p>}</div>{member.userId !== userId && <form onSubmit={event => void updateMember(event, "remove", String(member.userId))}><button type="submit" className="rounded-md px-2 py-1 text-xs font-semibold text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400" disabled={memberBusy}>Remove</button></form>}</div>)}</div>
                {membersError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{membersError}</p>}
                <form onSubmit={event => void updateMember(event, "add")} className="mt-5 space-y-3 border-t border-stone-200 pt-5"><div><h3 className="text-sm font-semibold">Add a member</h3><p className="mt-1 text-xs leading-5 text-stone-500">Use their numeric user ID. The server checks whether you can manage this room.</p></div><label className="sr-only" htmlFor="member-user-id">User ID to add</label><input id="member-user-id" inputMode="numeric" pattern="[0-9]*" value={memberUserId} onChange={event => setMemberUserId(event.target.value)} placeholder="User ID" className={inputClass} /><button type="submit" className={`${secondaryButtonClass} w-full`} disabled={memberBusy || !memberUserId.trim()}>{memberBusy ? "Updating…" : "Add member"}</button>{memberFeedback && <p role="status" className="text-sm text-stone-600">{memberFeedback}</p>}</form>
              </>}
            </section>

            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 shadow-sm"><div className="flex items-center justify-between border-b border-stone-800 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Diagnostics</p><h2 className="mt-1 text-base font-semibold text-white">Connection log</h2></div><span className="font-mono text-xs text-stone-400">{logs.length} / {MAX_LOGS}</span></div><div ref={logScrollRef} aria-live="off" className="h-64 space-y-2 overflow-y-auto p-4 font-mono text-[11px] leading-5 text-stone-300 sm:h-80">{logs.length === 0 ? <p className="text-stone-500">Waiting for connection events…</p> : logs.map(entry => <p key={entry.id} className="break-all border-b border-stone-800 pb-2">{entry.text}</p>)}</div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
