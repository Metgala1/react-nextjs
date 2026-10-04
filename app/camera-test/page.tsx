"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CallStatus = "idle" | "calling" | "ringing" | "connecting" | "connected" | "ended";
type UserId = string | number;

type ClientMessage =
  | { type: "call.initiate"; targetUserId: UserId }
  | { type: "call.accept"; targetUserId: UserId }
  | { type: "call.reject"; targetUserId: UserId }
  | { type: "call.offer"; targetUserId: UserId; offer: RTCSessionDescriptionInit }
  | { type: "call.answer"; targetUserId: UserId; answer: RTCSessionDescriptionInit }
  | { type: "ice.candidate"; targetUserId: UserId; candidate: RTCIceCandidateInit }
  | { type: "call.end"; targetUserId: UserId };

type ServerMessage =
  | { type: "call.incoming"; fromUserId: UserId }
  | { type: "call.accept"; fromUserId: UserId }
  | { type: "call.reject"; fromUserId: UserId }
  | { type: "call.offer"; fromUserId: UserId; offer: RTCSessionDescriptionInit }
  | { type: "call.answer"; fromUserId: UserId; answer: RTCSessionDescriptionInit }
  | { type: "ice.candidate"; fromUserId: UserId; candidate: RTCIceCandidateInit }
  | { type: "call.end"; fromUserId: UserId }
  | { type: "call.error"; message?: string };

type Props = {
  /** Authenticated user's ID. The signaling server must bind/verify this identity. */
  userId: UserId;
  /** Optional override; defaults to NEXT_PUBLIC_WS_URL or ws://localhost:3001. */
  signalingUrl?: string;
};

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

function describeError(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError": return "Camera or microphone permission was denied.";
      case "NotFoundError": return "No camera or microphone was found.";
      case "NotReadableError": return "The camera or microphone is in use by another app.";
      case "OverconstrainedError": return "The requested camera or microphone settings are unavailable.";
    }
  }
  if (typeof navigator !== "undefined" && !navigator.mediaDevices) {
    return "Camera access requires HTTPS or localhost.";
  }
  return error instanceof Error ? error.message : "The call could not be completed.";
}

function isServerMessage(value: unknown): value is ServerMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  const knownTypes = ["call.incoming", "call.accept", "call.reject", "call.offer", "call.answer", "ice.candidate", "call.end", "call.error"];
  return typeof message.type === "string" && knownTypes.includes(message.type) &&
    (message.type === "call.error" || ("fromUserId" in message));
}

export default function VideoCall({ userId, signalingUrl }: Props) {
  const wsUrl = signalingUrl ?? process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";
  const [status, setStatus] = useState<CallStatus>("idle");
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [peerIdInput, setPeerIdInput] = useState("");
  const [peerId, setPeerId] = useState<UserId | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketReady, setSocketReady] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const peerIdRef = useRef<UserId | null>(null);
  const statusRef = useRef<CallStatus>("idle");
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const mountedRef = useRef(false);

  const changeStatus = useCallback((next: CallStatus) => {
    statusRef.current = next;
    if (mountedRef.current) setStatus(next);
  }, []);

  const busy = ["calling", "ringing", "connecting", "connected"].includes(status);

  const send = useCallback((message: ClientMessage): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      if (mountedRef.current) setError("Signaling server is not connected.");
      return false;
    }
    socket.send(JSON.stringify(message));
    return true;
  }, []);

  const ensureLocalMedia = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS or localhost.");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("Call component was closed.");
    }
    streamRef.current = stream;
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of queued) await pc.addIceCandidate(candidate);
  }, []);

  const getPeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    const stream = await ensureLocalMedia();
    const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
    peerConnectionRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      const targetUserId = peerIdRef.current;
      if (event.candidate && targetUserId != null) {
        send({ type: "ice.candidate", targetUserId, candidate: event.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => {
      const streamFromPeer = event.streams[0];
      if (streamFromPeer) {
        setRemoteStream(streamFromPeer);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = streamFromPeer;
      } else {
        // Fallback for peers that add tracks without associating a stream.
        setRemoteStream((current) => {
          const next = current ?? new MediaStream();
          if (!next.getTracks().some((track) => track.id === event.track.id)) next.addTrack(event.track);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = next;
          return next;
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (!mountedRef.current || peerConnectionRef.current !== pc) return;
      setConnectionState(pc.connectionState);
      if (pc.connectionState === "connected") changeStatus("connected");
      // disconnected may recover; retain the peer connection and let ICE recover.
      if (pc.connectionState === "failed") {
        setError("The network path failed. You can end the call and try again.");
        changeStatus("ended");
      }
    };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        console.warn("ICE connection failed; no working media route was found.");
      }
    };
    return pc;
  }, [changeStatus, ensureLocalMedia, send]);

  const cleanupMedia = useCallback(() => {
    const pc = peerConnectionRef.current;
    peerConnectionRef.current = null;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (mountedRef.current) setConnectionState("closed");
  }, []);

  const finishCall = useCallback((notifyPeer: boolean, nextStatus: CallStatus = "ended") => {
    const targetUserId = peerIdRef.current;
    if (notifyPeer && targetUserId != null) send({ type: "call.end", targetUserId });
    cleanupMedia();
    peerIdRef.current = null;
    setPeerId(null);
    changeStatus(nextStatus);
  }, [changeStatus, cleanupMedia, send]);

  const stopCameraPreview = useCallback(() => {
    if (busy) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLocalStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }, [busy]);

  const startCamera = useCallback(async () => {
    setCameraStarting(true);
    setError(null);
    try { await ensureLocalMedia(); }
    catch (cause) { setError(describeError(cause)); }
    finally { if (mountedRef.current) setCameraStarting(false); }
  }, [ensureLocalMedia]);

  const startCall = useCallback(async () => {
    const targetUserId = peerIdInput.trim();
    if (!targetUserId) { setError("Enter the other user's ID to call."); return; }
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError("Wait for the signaling server to connect."); return;
    }
    if (statusRef.current === "calling" || statusRef.current === "ringing" || statusRef.current === "connecting" || statusRef.current === "connected") return;
    setError(null);
    peerIdRef.current = targetUserId;
    setPeerId(targetUserId);
    if (!send({ type: "call.initiate", targetUserId })) {
      peerIdRef.current = null;
      setPeerId(null);
      return;
    }
    changeStatus("calling");
  }, [changeStatus, peerIdInput, send]);

  const acceptCall = useCallback(async () => {
    const callerId = peerIdRef.current;
    if (callerId == null) return;
    setError(null);
    try {
      await getPeerConnection(); // Acquire media before accepting so failure can be shown locally.
      if (!send({ type: "call.accept", targetUserId: callerId })) return;
      changeStatus("connecting");
    } catch (cause) {
      setError(describeError(cause));
      send({ type: "call.reject", targetUserId: callerId });
      finishCall(false, "ended");
    }
  }, [changeStatus, finishCall, getPeerConnection, send]);

  const rejectCall = useCallback(() => {
    const callerId = peerIdRef.current;
    if (callerId != null) send({ type: "call.reject", targetUserId: callerId });
    finishCall(false, "ended");
  }, [finishCall, send]);

  const handleServerMessage = useCallback(async (message: ServerMessage) => {
    if (message.type === "call.error") {
      setError(message.message || "The signaling server reported an error.");
      if (["calling", "ringing"].includes(statusRef.current)) finishCall(false, "ended");
      return;
    }
    const from = message.fromUserId;
    switch (message.type) {
      case "call.incoming":
        if (statusRef.current !== "idle" && statusRef.current !== "ended") {
          send({ type: "call.reject", targetUserId: from });
          return;
        }
        peerIdRef.current = from;
        setPeerId(from);
        changeStatus("ringing");
        break;
      case "call.accept": {
        if (peerIdRef.current !== from || statusRef.current !== "calling") return;
        changeStatus("connecting");
        try {
          const pc = await getPeerConnection();
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ type: "call.offer", targetUserId: from, offer: pc.localDescription ?? offer });
        } catch (cause) {
          setError(describeError(cause));
          finishCall(true, "ended");
        }
        break;
      }
      case "call.reject":
        if (peerIdRef.current === from) finishCall(false, "ended");
        break;
      case "call.offer": {
        if (peerIdRef.current !== from || statusRef.current !== "connecting") return;
        try {
          const pc = await getPeerConnection();
          await pc.setRemoteDescription(message.offer);
          await flushPendingCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send({ type: "call.answer", targetUserId: from, answer: pc.localDescription ?? answer });
        } catch (cause) {
          setError(describeError(cause));
          finishCall(true, "ended");
        }
        break;
      }
      case "call.answer": {
        const pc = peerConnectionRef.current;
        if (peerIdRef.current !== from || !pc || pc.signalingState !== "have-local-offer") return;
        try {
          await pc.setRemoteDescription(message.answer);
          await flushPendingCandidates(pc);
        } catch (cause) { setError(describeError(cause)); finishCall(true, "ended"); }
        break;
      }
      case "ice.candidate": {
        if (peerIdRef.current !== from) return;
        const pc = peerConnectionRef.current;
        if (!pc || !pc.remoteDescription) pendingCandidatesRef.current.push(message.candidate);
        else {
          try { await pc.addIceCandidate(message.candidate); }
          catch (cause) { console.warn("Could not add remote ICE candidate", cause); }
        }
        break;
      }
      case "call.end":
        if (peerIdRef.current === from) finishCall(false, "ended");
        break;
    }
  }, [changeStatus, finishCall, flushPendingCandidates, getPeerConnection, send]);

  useEffect(() => {
    mountedRef.current = true;
    let socket: WebSocket;
    try { socket = new WebSocket(wsUrl); }
    catch (cause) { setError(describeError(cause)); return; }
    socketRef.current = socket;
    socket.onopen = () => { if (mountedRef.current) setSocketReady(true); };
    socket.onmessage = (event) => {
      try {
        const parsed: unknown = JSON.parse(String(event.data));
        if (!isServerMessage(parsed)) { console.warn("Ignoring malformed signaling message."); return; }
        void handleServerMessage(parsed);
      } catch (cause) { console.warn("Could not read signaling message", cause); }
    };
    socket.onerror = () => { if (mountedRef.current) setError("Could not connect to the signaling server."); };
    socket.onclose = () => { if (mountedRef.current) { setSocketReady(false); setError("Signaling server disconnected."); } };
    return () => {
      mountedRef.current = false;
      // Unmount is local resource cleanup only; it must never emit call.end.
      cleanupMedia();
      peerIdRef.current = null;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
      socketRef.current = null;
    };
    // WebSocket connection is intentionally created once per component mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  useEffect(() => { if (localVideoRef.current) localVideoRef.current.srcObject = localStream; }, [localStream]);
  useEffect(() => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream; }, [remoteStream]);

  const endCall = () => finishCall(true, "ended");
  const statusLabel: Record<CallStatus, string> = {
    idle: "Ready", calling: "Calling…", ringing: "Incoming call", connecting: "Connecting…", connected: "Connected", ended: "Call ended",
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">WebRTC video call</h1>
        <p className="mt-2 text-sm text-slate-400">WebSocket carries call signaling. WebRTC carries audio and video. Signed in as {String(userId)}.</p>
        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${socketReady ? "bg-emerald-400" : "bg-amber-400"}`} />
          Signaling {socketReady ? "connected" : "connecting"}
          <span className="ml-3 text-slate-400">Call: {statusLabel[status]}</span>
          {busy && peerId != null && <span className="text-slate-400">with {String(peerId)}</span>}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-medium text-slate-300">You</h2>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <video ref={localVideoRef} autoPlay playsInline muted className={`h-full w-full object-cover ${localStream ? "" : "hidden"}`} />
              {!localStream && <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">Camera preview is off</div>}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Other person</h2>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <video ref={remoteVideoRef} autoPlay playsInline className={`h-full w-full object-cover ${remoteStream ? "" : "hidden"}`} />
              {!remoteStream && <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">Waiting for remote media</div>}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm">
          <p className="text-slate-400">WebRTC connection</p>
          <p className="mt-1 font-medium">{connectionState}</p>
        </div>

        {status === "ringing" && (
          <div className="mt-5 rounded-xl border border-blue-700 bg-blue-950/50 p-4" role="status">
            <p className="font-medium">Incoming call from {String(peerId)}</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => void acceptCall()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-700">Accept</button>
              <button onClick={rejectCall} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700">Reject</button>
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={() => void startCamera()} disabled={!!localStream || cameraStarting || busy} className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50">
            {cameraStarting ? "Starting camera…" : "Start camera preview"}
          </button>
          <button onClick={stopCameraPreview} disabled={!localStream || busy} className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50">Stop preview</button>
          <input aria-label="Target user ID" value={peerIdInput} onChange={(event) => setPeerIdInput(event.target.value)} placeholder="Other user's ID" disabled={busy} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50" />
          <button onClick={() => void startCall()} disabled={busy || !socketReady} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Call</button>
          <button onClick={endCall} disabled={!busy} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">End call</button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Starting the preview only requests local camera and microphone access; it does not call anyone.</p>
      </section>
    </main>
  );
}