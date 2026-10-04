"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

type SignalingMessage =
  | {
      type: "call.offer";
      offer: RTCSessionDescriptionInit;
    }
  | {
      type: "call.answer";
      answer: RTCSessionDescriptionInit;
    }
  | {
      type: "ice.candidate";
      candidate: RTCIceCandidateInit;
    }
  | {
      type: "call.end";
    };

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "Permission denied. Allow camera and microphone access.";

      case "NotFoundError":
        return "No camera or microphone was found on this device.";

      case "NotReadableError":
        return "The camera or microphone is already being used by another app.";

      case "OverconstrainedError":
        return "The requested camera or microphone configuration is not available.";
    }
  }

  if (!navigator.mediaDevices) {
    return "Camera access requires HTTPS or localhost.";
  }

  return "Could not start the camera and microphone.";
}

export default function CameraTest() {
  const [isOn, setIsOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const peerConnectionRef =
    useRef<RTCPeerConnection | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const mountedRef = useRef(true);

  /*
   * Send a signaling message through WebSocket.
   */
  const sendSignalingMessage = useCallback(
    (message: SignalingMessage) => {
      const socket = wsRef.current;

      if (!socket) {
        console.error("WebSocket does not exist.");
        return;
      }

      if (socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected.");
        return;
      }

      socket.send(JSON.stringify(message));
    },
    []
  );

  /*
   * Create the WebRTC peer connection.
   */
  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      /*
       * Add our camera and microphone tracks
       * to the WebRTC connection.
       */
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      /*
       * ICE candidate discovered.
       *
       * Send it to the other browser through WebSocket.
       */
      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("ICE candidate gathering complete.");
          return;
        }

        console.log(
          "New ICE candidate:",
          event.candidate
        );

        sendSignalingMessage({
          type: "ice.candidate",
          candidate: event.candidate.toJSON(),
        });
      };

      /*
       * The other person's audio/video arrives here.
       */
      peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.track);

        const [remoteStream] = event.streams;

        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      /*
       * Monitor the WebRTC connection.
       */
      peerConnection.onconnectionstatechange = () => {
        console.log(
          "Connection state:",
          peerConnection.connectionState
        );

        if (mountedRef.current) {
          setConnectionState(peerConnection.connectionState);
        }

        if (
          peerConnection.connectionState === "failed" ||
          peerConnection.connectionState === "closed"
        ) {
          console.log("WebRTC connection ended.");
        }
      };

      /*
       * Useful for debugging ICE specifically.
       */
      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "ICE connection state:",
          peerConnection.iceConnectionState
        );
      };

      return peerConnection;
    },
    [sendSignalingMessage]
  );

  /*
   * Create the offer.
   */
  const createOffer = useCallback(
    async (peerConnection: RTCPeerConnection) => {
      console.log("Creating offer...");

      const offer = await peerConnection.createOffer();

      console.log("Offer created:", offer);

      /*
       * Tell this RTCPeerConnection:
       *
       * "This is my local description."
       */
      await peerConnection.setLocalDescription(offer);

      console.log("Local description set.");

      /*
       * Send the offer to the other browser.
       */
      sendSignalingMessage({
        type: "call.offer",
        offer,
      });

      console.log("Offer sent through WebSocket.");
    },
    [sendSignalingMessage]
  );

  /*
   * Receive signaling messages from the server.
   */
  const handleSignalingMessage = useCallback(
    async (message: SignalingMessage) => {
      const peerConnection =
        peerConnectionRef.current;

      if (!peerConnection) {
        console.warn(
          "Received signaling message but no peer connection exists."
        );

        return;
      }

      try {
        /*
         * OTHER USER SENT US AN OFFER
         */
        if (message.type === "call.offer") {
          console.log("Received offer.");

          await peerConnection.setRemoteDescription(
            message.offer
          );

          console.log(
            "Remote offer description set."
          );

          const answer =
            await peerConnection.createAnswer();

          console.log("Answer created.");

          await peerConnection.setLocalDescription(
            answer
          );

          console.log(
            "Local answer description set."
          );

          sendSignalingMessage({
            type: "call.answer",
            answer,
          });

          console.log(
            "Answer sent through WebSocket."
          );

          return;
        }

        /*
         * OTHER USER SENT US AN ANSWER
         */
        if (message.type === "call.answer") {
          console.log("Received answer.");

          await peerConnection.setRemoteDescription(
            message.answer
          );

          console.log(
            "Remote answer description set."
          );

          return;
        }

        /*
         * OTHER USER SENT US AN ICE CANDIDATE
         */
        if (message.type === "ice.candidate") {
          console.log(
            "Received remote ICE candidate."
          );

          await peerConnection.addIceCandidate(
            message.candidate
          );

          console.log(
            "Remote ICE candidate added."
          );

          return;
        }

        /*
         * OTHER USER ENDED THE CALL
         */
        if (message.type === "call.end") {
          console.log("Remote user ended the call.");

          peerConnection.close();

          peerConnectionRef.current = null;

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }

          if (mountedRef.current) {
            setConnectionState("closed");
          }
        }
      } catch (err) {
        console.error(
          "Failed to process signaling message:",
          err
        );

        if (mountedRef.current) {
          setError(
            "A WebRTC signaling error occurred."
          );
        }
      }
    },
    [sendSignalingMessage]
  );

  /*
   * Start camera + microphone.
   */
  const startCamera = async () => {
    if (streamRef.current || starting) {
      return;
    }

    setStarting(true);
    setError(null);

    try {
      /*
       * Ask the browser for camera + microphone.
       */
      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      /*
       * Component may have disappeared while
       * getUserMedia() was waiting for permission.
       */
      if (!mountedRef.current) {
        mediaStream
          .getTracks()
          .forEach((track) => track.stop());

        return;
      }

      /*
       * Store MediaStream.
       */
      streamRef.current = mediaStream;

      /*
       * Show our own camera.
       */
      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          mediaStream;
      }

      /*
       * Create WebRTC connection.
       */
      const peerConnection =
        createPeerConnection(mediaStream);

      peerConnectionRef.current =
        peerConnection;

      /*
       * For testing:
       *
       * create the offer immediately.
       *
       * Later we'll control who starts the call.
       */
      await createOffer(peerConnection);

      setIsOn(true);
    } catch (err) {
      console.error(
        "Camera/microphone access failed:",
        err
      );

      stopCamera();

      if (mountedRef.current) {
        setError(describeError(err));
      }
    } finally {
      if (mountedRef.current) {
        setStarting(false);
      }
    }
  };

  /*
   * Stop everything.
   */
  const stopCamera = useCallback(() => {
    /*
     * Tell the other user that the call ended.
     */
    sendSignalingMessage({
      type: "call.end",
    });

    /*
     * Close WebRTC connection.
     */
    peerConnectionRef.current?.close();

    peerConnectionRef.current = null;

    /*
     * Stop camera + microphone tracks.
     */
    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current = null;

    /*
     * Remove local video.
     */
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    /*
     * Remove remote video.
     */
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsOn(false);
    setConnectionState("closed");
  }, [sendSignalingMessage]);

  /*
   * WebSocket setup.
   */
  useEffect(() => {
    mountedRef.current = true;

    const socket = new WebSocket(WS_URL);

    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected.");
    };

    socket.onmessage = (event) => {
      try {
        const message =
          JSON.parse(event.data) as SignalingMessage;

        console.log(
          "WebSocket signaling message:",
          message
        );

        void handleSignalingMessage(message);
      } catch (err) {
        console.error(
          "Invalid WebSocket message:",
          err
        );
      }
    };

    socket.onerror = (event) => {
      console.error(
        "WebSocket error:",
        event
      );
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected.");
    };

    return () => {
      mountedRef.current = false;

      /*
       * Don't send call.end during unmount if
       * the socket is already closed.
       */
      peerConnectionRef.current?.close();

      peerConnectionRef.current = null;

      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      socket.close();
      wsRef.current = null;
    };
  }, [handleSignalingMessage]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold">
          WebRTC Video Call
        </h1>

        <p className="mb-8 text-sm text-slate-400">
          WebSocket signaling + WebRTC media
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Local video */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-slate-300">
              You
            </h2>

            <div className="aspect-video overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
              {!isOn && (
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-slate-500">
                    {starting
                      ? "Waiting for permission..."
                      : "Camera is off"}
                  </span>
                </div>
              )}

              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  !isOn ? "hidden" : ""
                }`}
              />
            </div>
          </div>

          {/* Remote video */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-slate-300">
              Remote user
            </h2>

            <div className="aspect-video overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              {!remoteVideoRef.current?.srcObject && (
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-slate-500">
                    Waiting for remote video...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection state */}
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">
            WebRTC connection state
          </p>

          <p className="mt-1 text-sm font-medium">
            {connectionState}
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {/* Controls */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={startCamera}
            disabled={isOn || starting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            {starting
              ? "Starting..."
              : "Start Camera"}
          </button>

          <button
            onClick={stopCamera}
            disabled={!isOn}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}