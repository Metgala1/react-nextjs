"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings so this compiles without extra @types packages */
interface SpeechRecognitionAlternativeLike {
    transcript: string;
}
interface SpeechRecognitionResultLike {
    isFinal: boolean;
    0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
    resultIndex: number;
    results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionErrorEventLike {
    error: string;
}
interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
    "not-allowed": "Microphone access was denied. Allow it in your browser settings and try again.",
    "service-not-allowed": "Microphone access was denied. Allow it in your browser settings and try again.",
    "no-speech": "No speech detected. Try again and speak a little closer to the mic.",
    "audio-capture": "No microphone was found on this device.",
    network: "A network error occurred during recognition.",
};

export default function VoiceInput({ lang = "en-US" }: { lang?: string }) {
    const [finalText, setFinalText] = useState("");
    const [interimText, setInterimText] = useState("");
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

    // Check support after mount (avoids SSR/hydration mismatch)
    useEffect(() => {
        setSupported(getSpeechRecognition() !== null);
        return () => recognitionRef.current?.abort();
    }, []);

    const start = useCallback(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        setError(null);

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => setListening(true);

        recognition.onend = () => {
            setListening(false);
            setInterimText("");
        };

        recognition.onerror = (event) => {
            setError(ERROR_MESSAGES[event.error] ?? `Speech recognition error: ${event.error}`);
            setListening(false);
            
        };

        recognition.onresult = (event) => {
            let finals = "";
            let interim = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finals += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            if (finals) {
                setFinalText((prev) => (prev ? `${prev} ${finals.trim()}` : finals.trim()));
            }
            setInterimText(interim);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [lang]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const toggle = () => (listening ? stop() : start());

    const clear = () => {
        setFinalText("");
        setInterimText("");
        setError(null);
    };

    const hasText = finalText || interimText;

    if (!supported) {
        return (
            <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                Speech recognition isn&apos;t supported in this browser. Try Chrome, Edge, or Safari.
            </div>
        );
    }

    return (
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="flex flex-col items-center gap-4">
                {/* Mic button */}
                <div className="relative flex items-center justify-center">
                    {listening && (
                        <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-rose-400/40" />
                    )}
                    <button
                        type="button"
                        onClick={toggle}
                        aria-pressed={listening}
                        aria-label={listening ? "Stop listening" : "Start listening"}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 ${
                            listening
                                ? "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-200"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 focus-visible:ring-indigo-200"
                        }`}
                    >
                        {listening ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8"
                            >
                                <rect x="9" y="2" width="6" height="12" rx="3" />
                                <path d="M5 11a7 7 0 0 0 14 0" />
                                <path d="M12 18v4" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Status */}
                <p
                    aria-live="polite"
                    className={`text-sm font-semibold ${
                        listening ? "text-rose-600" : "text-slate-500"
                    }`}
                >
                    {listening ? "Listening… tap to stop" : "Tap the mic to start speaking"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
                >
                    {error}
                </div>
            )}

            {/* Transcript */}
            <div className="mt-6 min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {hasText ? (
                    <p className="text-sm leading-relaxed text-slate-800">
                        {finalText}
                        {interimText && (
                            <span className="italic text-slate-400">
                                {finalText ? " " : ""}
                                {interimText}
                            </span>
                        )}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400">Your transcript will appear here…</p>
                )}
            </div>

            {/* Actions */}
            {hasText && !listening && (
                <div className="mt-4 flex justify-end gap-3 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(finalText)}
                        className="text-indigo-600 hover:underline"
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        onClick={clear}
                        className="text-slate-500 hover:text-slate-700 hover:underline"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}