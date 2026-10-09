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
    if (typeof window === "undefined") {
        return null;
    }

    const browserWindow = window as unknown as SpeechRecognitionWindow;

    return (
        browserWindow.SpeechRecognition ??
        browserWindow.webkitSpeechRecognition ??
        null
    );
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

    // Check browser support after mounting.
    useEffect(() => {
        setIsSupported(getRecognitionConstructor() !== null);
    }, []);

    // Remove event handlers when a session is no longer active.
    const detach = useCallback((recognition: AppSpeechRecognition) => {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
    }, []);

    // Release the browser resource when the component unmounts.
    useEffect(() => {
        return () => {
            const recognition = recognitionRef.current;

            recognitionRef.current = null;

            if (!recognition) {
                return;
            }

            detach(recognition);

            try {
                recognition.abort();
            } catch {
                // The recognition session may already have ended.
            }
        };
    }, [detach]);

    const startListening = useCallback(() => {
        // Do not start a second session while one is active.
        if (recognitionRef.current) {
            return;
        }

        const Recognition = getRecognitionConstructor();

        if (!Recognition) {
            setError(
                "Speech recognition is not supported in this browser."
            );
            setStatus("error");
            return;
        }

        let recognition: AppSpeechRecognition;

        try {
            recognition = new Recognition();
        } catch {
            setError("Unable to create a speech recognition session.");
            setStatus("error");
            return;
        }

        recognitionRef.current = recognition;

        // Start each session with a fresh transcript.
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
            if (!isCurrent()) {
                return;
            }

            setStatus("listening");
        };

        recognition.onresult = (event) => {
            if (!isCurrent()) {
                return;
            }

            let interim = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const result = event.results[i];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    const current = finalTranscriptRef.current;

                    const needsSpace =
                        current.length > 0 &&
                        !current.endsWith(" ") &&
                        !transcript.startsWith(" ");

                    finalTranscriptRef.current +=
                        (needsSpace ? " " : "") + transcript;
                } else {
                    interim += transcript;
                }
            }

            setText(finalTranscriptRef.current);
            setInterimText(interim);
        };

        recognition.onerror = (event) => {
            if (!isCurrent()) {
                return;
            }

            // Aborting is an intentional cancellation, not a user-facing error.
            if (event.error === "aborted") {
                return;
            }

            setError(
                ERROR_MESSAGES[event.error] ??
                    `Speech recognition error: ${event.error}`
            );

            setStatus("error");
        };

        recognition.onend = () => {
            if (!isCurrent()) {
                return;
            }

            recognitionRef.current = null;

            setInterimText("");

            // Do not erase an error reported by the browser.
            setStatus((currentStatus) =>
                currentStatus === "error" ? "error" : "idle"
            );
        };

        try {
            recognition.start();
        } catch {
            // Invalidate this session before attempting cleanup.
            if (recognitionRef.current === recognition) {
                recognitionRef.current = null;
            }

            detach(recognition);

            try {
                recognition.abort();
            } catch {
                // The session may never have started.
            }

            setError("Unable to start speech recognition.");
            setStatus("error");
        }
    }, [lang, continuous, detach]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;

        if (!recognition) {
            return;
        }

        setStatus("stopping");

        try {
            recognition.stop();
        } catch {
            if (recognitionRef.current === recognition) {
                recognitionRef.current = null;
            }

            detach(recognition);

            try {
                recognition.abort();
            } catch {
                // The session may already be inactive.
            }

            setError("Unable to stop speech recognition.");
            setStatus("error");
        }
    }, [detach]);

    const abortListening = useCallback(() => {
        const recognition = recognitionRef.current;

        if (!recognition) {
            return;
        }

        // Aborting means discard the current transcript.
        finalTranscriptRef.current = "";

        setText("");
        setInterimText("");
        setStatus("stopping");

        try {
            recognition.abort();
        } catch {
            if (recognitionRef.current === recognition) {
                recognitionRef.current = null;
            }

            detach(recognition);
            setStatus("idle");
        }
    }, [detach]);

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