"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export default function VoiceInput({ lang = "en-US" }: { lang?: string }) {
    const {
        text,
        interimText,
        status,
        error,
        isSupported,
        isListening,
        startListening,
        stopListening,
        clearTranscript,
    } = useSpeechRecognition({ lang, continuous: true });

    const isBusy = status === "starting" || status === "stopping";
    const hasText = Boolean(text || interimText);

    const toggle = () => (isListening ? stopListening() : startListening());

    const statusLabel = {
        idle: "Tap the mic to start speaking",
        starting: "Starting…",
        listening: "Listening… tap to stop",
        stopping: "Finishing up…",
        error: "Tap the mic to try again",
    }[status];

    if (!isSupported) {
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
                    {isListening && (
                        <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-rose-400/40" />
                    )}
                    <button
                        type="button"
                        onClick={toggle}
                        disabled={isBusy}
                        aria-pressed={isListening}
                        aria-label={isListening ? "Stop listening" : "Start listening"}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                            isListening
                                ? "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-200"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 focus-visible:ring-indigo-200"
                        }`}
                    >
                        {isListening ? (
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
                        isListening ? "text-rose-600" : "text-slate-500"
                    }`}
                >
                    {statusLabel}
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
                        {text}
                        {interimText && (
                            <span className="italic text-slate-400">
                                {text ? " " : ""}
                                {interimText}
                            </span>
                        )}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400">Your transcript will appear here…</p>
                )}
            </div>

            {/* Actions */}
            {hasText && !isListening && (
                <div className="mt-4 flex justify-end gap-3 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(text)}
                        className="text-indigo-600 hover:underline"
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        onClick={clearTranscript}
                        className="text-slate-500 hover:text-slate-700 hover:underline"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}