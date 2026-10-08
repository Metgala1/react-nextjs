export {};

declare global {
    interface AppSpeechRecognitionAlternative {
        transcript: string;
        confidence: number;
    }
    interface AppSpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;

        [index: number]: AppSpeechRecognitionAlternative;
    }
   
    interface AppSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;

    start(): void;
    stop(): void;
    abort(): void;
    }
    interface AppSpeechRecognitionConstructor {
    new (): AppSpeechRecognition;
    }
    interface Window {
    SpeechRecognition?: AppSpeechRecognitionConstructor;
    webkitSpeechRecognition?: AppSpeechRecognitionConstructor;
    }
}