export type RecognitionStatus =
    | "idle"
    | "starting"
    | "listening"
    | "stopping"
    | "error";

export type AppSpeechRecognitionErrorCode =
    | "aborted"
    | "audio-capture"
    | "bad-grammar"
    | "language-not-supported"
    | "network"
    | "no-speech"
    | "not-allowed"
    | "service-not-allowed";

export interface AppSpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

export interface AppSpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): AppSpeechRecognitionAlternative;
    readonly [index: number]: AppSpeechRecognitionAlternative;
}

export interface AppSpeechRecognitionResultList {
    readonly length: number;
    item(index: number): AppSpeechRecognitionResult;
    readonly [index: number]: AppSpeechRecognitionResult;
}

export interface AppSpeechRecognitionEvent {
    readonly resultIndex: number;
    readonly results: AppSpeechRecognitionResultList;
}

export interface AppSpeechRecognitionErrorEvent {
    readonly error: AppSpeechRecognitionErrorCode;
    readonly message: string;
}

export interface AppSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: AppSpeechRecognitionEvent) => void) | null;
    onerror: ((event: AppSpeechRecognitionErrorEvent) => void) | null;

    start(): void;
    stop(): void;
    abort(): void;
}

export interface AppSpeechRecognitionConstructor {
    new (): AppSpeechRecognition;
}

export interface SpeechRecognitionWindow {
    SpeechRecognition?: AppSpeechRecognitionConstructor;
    webkitSpeechRecognition?: AppSpeechRecognitionConstructor;
}