"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
    AppSpeechRecognition,
    AppSpeechRecognitionConstructor,
    AppSpeechRecognitionErrorCode,
    RecognitionStatus,
    SpeechRecognitionWindow,
} from "@/types/speech-recognition";

interface UseSpeechRecognitionOptions {
    lang?: string;
    continuous?: boolean;
}

const ERROR_MESSAGES: Partial<Record<AppSpeechRecognitionErrorCode, string>> = {
    "no-speech": "No speech was detected. Please try again.",
    "audio-capture": "No microphone was found.",
    "not-allowed": "Microphone permission was denied.",
    "service-not-allowed": "Speech recognition service is not allowed.",
    network: "A network error occurred during speech recognition.",
    "language-not-supported": "This language is not supported.",
};

function getRecognitionConstructor(): AppSpeechRecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as SpeechRecognitionWindow;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition({
    lang = "en-US",
    continuous = false,
}: UseSpeechRecognitionOptions = {}) {
    const [text, setText] = useState("");
    const [interimText, setInterimText] = useState("");
    const [status, setStatus] = useState<RecognitionStatus>("idle");
    const [error, setError] = useState("");
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<AppSpeechRecognition | null>(null);
    const finalTranscriptRef = useRef("");

    // Checked in an effect so server and client first render match (no hydration mismatch)
    useEffect(() => {
        setIsSupported(getRecognitionConstructor() !== null);
    }, []);

    const detach = useCallback((recognition: AppSpeechRecognition) => {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            const recognition = recognitionRef.current;
            if (!recognition) return;
            recognitionRef.current = null;
            detach(recognition);
            recognition.abort();
        };
    }, [detach]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) return;

        const Recognition = getRecognitionConstructor();
        if (!Recognition) {
            setError("Speech recognition is not supported in this browser.");
            setStatus("error");
            return;
        }

        const recognition = new Recognition();
        recognitionRef.current = recognition;

        finalTranscriptRef.current = "";
        setText("");
        setInterimText("");
        setError("");
        setStatus("starting");

        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        const isCurrent = () => recognitionRef.current === recognition;

        recognition.onstart = () => {
            if (!isCurrent()) return;
            setStatus("listening");
        };

        recognition.onresult = (event) => {
            if (!isCurrent()) return;

            let interim = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    const current = finalTranscriptRef.current;
                    const needsSpace =
                        current.length > 0 &&
                        !current.endsWith(" ") &&
                        !transcript.startsWith(" ");
                    finalTranscriptRef.current += (needsSpace ? " " : "") + transcript;
                } else {
                    interim += transcript;
                }
            }

            setText(finalTranscriptRef.current);
            setInterimText(interim);
        };

        recognition.onerror = (event) => {
            if (!isCurrent()) return;

            // abort() triggers "aborted", which isn't a real error
            if (event.error === "aborted") return;

            setError(
                ERROR_MESSAGES[event.error] ??
                    `Speech recognition error: ${event.error}`
            );
            setStatus("error");
        };

        // onend always fires last (after stop, abort, or error)
        recognition.onend = () => {
            if (!isCurrent()) return;

            recognitionRef.current = null;
            setInterimText("");
            setStatus((current) => (current === "error" ? "error" : "idle"));
        };

        try {
            recognition.start();
        } catch {
            recognitionRef.current = null;
            setStatus("error");
            setError("Unable to start speech recognition.");
        }
    }, [lang, continuous]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        setStatus("stopping");
        recognition.stop(); // onend will move status to "idle"
    }, []);

    const abortListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        recognition.abort(); // onend will move status to "idle"
    }, []);

    const clearTranscript = useCallback(() => {
        finalTranscriptRef.current = "";
        setText("");
        setInterimText("");
    }, []);

    return {
        text,
        interimText,
        status,
        error,
        isSupported,
        isListening: status === "listening",
        startListening,
        stopListening,
        abortListening,
        clearTranscript,
    };
}