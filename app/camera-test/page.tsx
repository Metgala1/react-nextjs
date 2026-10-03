"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "Permission denied. Allow camera access in your browser settings.";
      case "NotFoundError":
        return "No camera or microphone was found on this device.";
      case "NotReadableError":
        return "The camera is already in use by another app.";
    }
  }
  if (!navigator.mediaDevices) {
    return "Camera access needs HTTPS (or localhost).";
  }
  return "Could not start the camera.";
}

async function createPeerConnection(stream: MediaStream) {
  const pc = new RTCPeerConnection();

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  // Create and set the local offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  
  // In a real app, you would now send this offer to your signaling server
  console.log("Created offer:", offer);

  return pc;
}

export default function CameraTest() {
  const [isOn, setIsOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mountedRef = useRef(true);

  const stopCamera = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsOn(false);
  }, []);

  const startCamera = async () => {
    if (streamRef.current || starting) return;

    setStarting(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!mountedRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Await the peer connection creation since it now handles the async offer
      peerConnectionRef.current = await createPeerConnection(mediaStream);

      setIsOn(true);
    } catch (err) {
      console.error("Camera/microphone access failed:", err);
      stopCamera();
      if (mountedRef.current) setError(describeError(err));
    } finally {
      if (mountedRef.current) setStarting(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl shadow-xl max-w-md mx-auto mt-10">
      <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden mb-6 flex items-center justify-center border border-slate-700">
        {!isOn && (
          <span className="text-slate-400 text-sm">
            {starting ? "Waiting for permission…" : "Camera is off"}
          </span>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isOn ? "hidden" : ""}`}
        />
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400 text-center">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={startCamera}
          disabled={isOn || starting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {starting ? "Starting…" : "Start Camera"}
        </button>
        <button
          onClick={stopCamera}
          disabled={!isOn}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
}