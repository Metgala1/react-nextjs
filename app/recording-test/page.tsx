"use client";

import { useState, useRef, useEffect } from "react";

type UploadResult = {
    id: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
};

export default function MicrophoneTest() {
    const [status, setStatus] = useState("Microphone not started");
    const streamRef = useRef<MediaStream | null>(null);
    const [isMicrophoeActive , setIsmicrophoneActive] = useState(false)

    const recorderRef = useRef<MediaRecorder | null>(null)
    const chunkRef = useRef<Blob[]>([])

    const [isRecording, setIsRecording] = useState(false)
    const [recordingUrl , setRecordingUrl] = useState<string | null>(null)
    const [error , setError] = useState<string | null>(null)
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

    const [isUploading, setIsUploading] = useState(false)
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

    function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => {
        track.stop();
    });
    streamRef.current = null;
    }
    
    async function startRecording() {
        setError(null);
        setRecordingBlob(null);
        setRecordingUrl(null);
        setUploadResult(null);

        if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            setError("Audio recording is not supported in this browser")
            return
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            })

            streamRef.current = stream

            //Recorder for microphone stream
            const recorder = new MediaRecorder(stream)

            recorderRef.current = recorder
            chunkRef.current = []

            recorder.ondataavailable = (event) => {
                if(event.data.size > 0) {
                    chunkRef.current.push(event.data)
                }
            }

            recorder.onstop = () => {
                const chucks = chunkRef.current;

                if(chucks.length > 0) {
                    const recordingBlob = new Blob(chucks, {
                        type: recorder.mimeType || chucks[0].type || "application/octet-stream",
                    })

                    const url = URL.createObjectURL(recordingBlob);

                    setRecordingUrl(url)
                    setRecordingBlob(recordingBlob)
                    setStatus("Recording finished")
                }else {
                    setError("No audio data was recorded.");
                    setStatus("Microphone stopped")
                }
                stream.getTracks().forEach(track => {
                    track.stop()
                })

                streamRef.current = null;
                recorderRef.current = null;

                setIsRecording(false)
                setIsmicrophoneActive(false)
            }
            recorder.start()
            setIsRecording(true)
            setIsmicrophoneActive(true)
            setRecordingUrl(null)
            setStatus("Recording...")

        }catch(error) {
            if (error instanceof DOMException) {
                if (error.name === "NotAllowedError") {
                    setError("Please allow microphone access to record.");
                } else if (error.name === "NotFoundError") {
                    setError("No microphone was found.");
                } else {
                setError("Unable to access the microphone.");
                }
            } else {
                setError("Something went wrong.");
            }

            //If the recording setup fails, release the microphone
            streamRef.current?.getTracks().forEach(track => {
                track.stop()
            })

            streamRef.current = null
            recorderRef.current = null;

            setIsRecording(false)
            setIsmicrophoneActive(false)
            setStatus("Could not access microphone")
            setError("Could not access the microphone or start recording.")
        }
    }
    

    function stopRecording() {
    const recorder = recorderRef.current;

    try {
        if (recorder && recorder.state !== "inactive") {
            setStatus("Stopping...");
            recorder.stop(); // flushes the last chunk, then fires onstop
        } else {
            // Nothing is recording, so make sure the UI isn't stuck
            recorderRef.current = null;
            setIsRecording(false);
            setIsmicrophoneActive(false);
            setStatus("Microphone stopped");
        }
    } catch (err) {
        console.error("Could not stop recorder:", err);
        recorderRef.current = null;
        setIsRecording(false);
        setIsmicrophoneActive(false);
        setStatus("Microphone stopped");
        setError("Something went wrong while stopping the recording.");
    } finally {
        // Always turn the microphone off, even if stop() threw
        releaseStream();
    }
    }

    function getAudioExtension(mimeType: string): string {
        if (mimeType.includes("webm")) return "webm";
        if (mimeType.includes("mp4")) return "mp4";
        if (mimeType.includes("ogg")) return "ogg";
        if (mimeType.includes("wav")) return "wav";

        return "audio";
    }

    function downloadRecording(blob: Blob) {
        const url = URL.createObjectURL(blob);
        const extension = getAudioExtension(blob.type);

        const link = document.createElement("a");

        link.href = url;
        link.download = `my-recording.${extension}`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        // Give the browser time to initiate the download.
        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    async function uploadRecording(blob: Blob): Promise<UploadResult> {
        const formData = new FormData();

        const extension = getAudioExtension(blob.type)
        formData.append(
            "audio",
            blob,
            `voice-message.${extension}`
        )

        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api"

        const response = await fetch(
            `${apiBase}/audio-recordings`,
            {
                method: "POST",
                body: formData
            }
        )

        if (!response.ok){
            // Show the server's message if it sent one
            const body = await response.json().catch(() => null)
            throw new Error(body?.error ?? "Failed to upload recording.")
        }

        const result = await response.json();
        return result
    }

    async function handleUpload() {
        if (!recordingBlob || isUploading) return

        setError(null)
        setIsUploading(true)
        setStatus("Uploading recording...")

        try {
            const result = await uploadRecording(recordingBlob)
            setUploadResult(result)
            setStatus("Recording uploaded")
        } catch (err) {
            console.error("Upload failed:", err)
            setError(err instanceof Error ? err.message : "Failed to upload recording.")
            setStatus("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    useEffect(() => {
        return () => {
            if (recordingUrl) {
                URL.revokeObjectURL(recordingUrl);
            }
        };
    }, [recordingUrl]);

    useEffect(() => {
        return () => {
            const recorder = recorderRef.current;

            if (recorder) {
                // Prevent its stop event from updating an unmounted component.
                recorder.ondataavailable = null;
                recorder.onstop = null;

                if (recorder.state !== "inactive") {
                    recorder.stop();
                }
            }

            streamRef.current?.getTracks().forEach((track) => {
                track.stop();
            });

            streamRef.current = null;
            recorderRef.current = null;
        };
    }, []);


    return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <header className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                    🎙️
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Microphone Test
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Check that your browser can access your microphone.
                    You will be asked for permission when you start.
                </p>
            </header>

            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                </p>
                <p className="mt-1 text-base font-medium text-gray-800">
                    {status}
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={isMicrophoeActive}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 enabled:hover:bg-indigo-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                    Start Microphone
                </button>

                <button
                    type="button"
                    onClick={stopRecording}
                    disabled={!isMicrophoeActive}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 enabled:hover:bg-gray-100 enabled:active:scale-95 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                >
                    Stop Microphone
                </button>
            </div>

            {error && (
                <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            {recordingUrl && (
                <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Recording
                    </p>
                    <audio controls src={recordingUrl} className="w-full" />
                </div>
            )}

            {recordingBlob && (
                <div className="mt-3 flex gap-3">
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading || uploadResult !== null}
                        className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 enabled:hover:bg-indigo-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        {isUploading
                            ? "Uploading..."
                            : uploadResult
                              ? "Uploaded ✓"
                              : "Upload Recording"}
                    </button>

                    <button
                        type="button"
                        onClick={() => downloadRecording(recordingBlob)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.69L6.28 8.47a.75.75 0 0 0-1.06 1.06l4.25 4.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 1 0-1.06-1.06l-2.97 2.97V2.75Z" />
                            <path d="M3.5 13.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                        </svg>
                        Download
                    </button>
                </div>
            )}

            {uploadResult && (
                <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                    Saved successfully. ID: {uploadResult.id}
                </p>
            )}
        </section>
    </main>
);
}