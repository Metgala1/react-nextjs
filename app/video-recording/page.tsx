"use client"
import { useEffect , useState , useRef } from "react"

export default function VideoCapture() {
    const videoRef = useRef<HTMLVideoElement | null >(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null)
    const chuckRef = useRef<Blob[]>([]);
    const recordedUrlRef = useRef<string | null>(null)
    const [recordedBlob , setRecordedBlob] = useState<Blob | null>(null)

    const [isCameraOn, setIsCameraOn] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [isRecording , setIsRecording] = useState(false)
    const [recordedUrl , setRecordedUrl] = useState("");
    const [recordedExtension, setRecordedExtension] = useState("webm")
    const [error, setError] = useState("")
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

        function getMediaErrorMessage(error: unknown): string {
            if (!(error instanceof Error)) {
                return "An unexpected media error occurred.";
            }

            switch (error.name) {
                case "NotAllowedError":
                return "Camera or microphone access was denied. Check your browser permissions.";

                case "NotFoundError":
                return "No suitable camera or microphone was found.";

                case "NotReadableError":
                return "The camera or microphone could not be accessed. Check whether another app is using it.";

                case "OverconstrainedError":
                return "The requested camera settings are not supported by this device.";

                default:
                return "Could not access the camera or microphone. Please try again.";
            }
        }

    async function startCamera(
        mode: "user" | "environment" = facingMode
    ) {
        if(isStarting) return

        try{
            setError("")
            setIsStarting(true)

            streamRef.current?.getTracks().forEach((track) => {
                track.stop()
            })

            streamRef.current = null

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    facingMode: {
                        ideal: mode
                    }
                }
            })

            streamRef.current = stream

            if(videoRef.current) {
                videoRef.current.srcObject = stream
            }

            setFacingMode(mode)
            setIsCameraOn(true)
        }catch(error) {
            // The old stream was already stopped above, so reset the UI
            if(videoRef.current) {
                videoRef.current.srcObject = null
            }
            setIsCameraOn(false)
            setError(getMediaErrorMessage(error));
            console.error(error)
        }finally {
            setIsStarting(false)
        }
        
    }

    function startRecording() {
        const stream = streamRef.current
        if(!stream ) {
            return
        }

        if(typeof MediaRecorder === "undefined") {
            setError("Video recording is not supported in this browser.")
            return
        }

        try{
            setError("")

            // Remove the previous recording before starting a new one
            if(recordedUrlRef.current) {
                URL.revokeObjectURL(recordedUrlRef.current)
                recordedUrlRef.current = null
            }
            setRecordedUrl("")
            
            const mimeType = [
                "video/webm;codecs=vp9",
                "video/webm;codecs=vp8",
                "video/mp4",
            ].find((type) => MediaRecorder.isTypeSupported(type))

            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) 
            : new MediaRecorder(stream);

            recorderRef.current = recorder
            chuckRef.current = []

            // Collect recorded data as the browser produces it.
            recorder.ondataavailable = (event) => {
                if(event.data.size > 0) {
                    chuckRef.current.push(event.data)
                }
            }

            // Build the finished video when recording stops.
            recorder.onstop = () => {
                const chunks = chuckRef.current

                if(chunks.length > 0) {
                    const blob = new Blob(chunks, {
                        type: recorder.mimeType
                    })

                    setRecordedBlob(blob)
                    const url = URL.createObjectURL(blob)

                    recordedUrlRef.current = url
                    setRecordedUrl(url)
                    setRecordedExtension(recorder.mimeType.includes("mp4") ? "mp4" : "webm")
                } else {
                    setError("No video data was recorded.")
                }

                recorderRef.current = null
                setIsRecording(false)
            }

            recorder.onerror = () => {
                setError("Something went wrong during recording.");
                recorderRef.current = null
                setIsRecording(false)
            }

            recorder.start()
            setIsRecording(true);

        }catch(error) {
            setError("Could not start video recording.");
            console.error(error)
        }
    }

    function stopRecording() {
        const recorder = recorderRef.current;

        if(recorder && recorder.state !== "inactive") {
            recorder.stop() // onstop builds the video and resets isRecording
        } else {
            setIsRecording(false)
        }
    }

    function stopCamera(){
            if(recorderRef.current?.state === "recording") {
                recorderRef.current.stop()
            }

            streamRef.current?.getTracks().forEach((track) => {
                track.stop()
            })

            streamRef.current = null

            if(videoRef.current) {
                videoRef.current.srcObject = null
            }
            setIsCameraOn(false)

        }
     useEffect(() => {
            return () => {
                const recorder = recorderRef.current

                if(recorder) {
                    // Stop its events from updating an unmounted component
                    recorder.ondataavailable = null
                    recorder.onstop = null
                    recorder.onerror = null

                    if(recorder.state !== "inactive") {
                        recorder.stop()
                    }
                }

                streamRef.current?.getTracks().forEach((track) => {
                    track.stop()
                })

                if(recordedUrlRef.current){
                     URL.revokeObjectURL(recordedUrlRef.current);
                }
            }
        },[])

    return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
            🎥
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Camera Test</h1>
          <p className="mt-2 text-sm text-gray-500">
            Check that your browser can access your camera and record a short
            clip. You will be asked for permission when you start.
          </p>
        </header>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${
              facingMode === "user" ? "-scale-x-100" : ""
            }`}
          />

          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
              <span className="text-4xl">📷</span>
              <p className="text-sm font-medium">
                {isStarting ? "Starting camera..." : "Camera is off"}
              </p>
            </div>
          )}

          {isCameraOn && (
            <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <span
                className={`h-2 w-2 rounded-full bg-red-500 ${
                  isRecording ? "animate-pulse" : "opacity-60"
                }`}
              />
              {isRecording ? "REC" : "Live"}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isCameraOn ? (
            <>
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-95"
                >
                  Stop recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isStarting}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 enabled:hover:bg-indigo-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  Start recording
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  startCamera(
                    facingMode === "user"
                      ? "environment"
                      : "user"
                  )
                }
                disabled={!isCameraOn || isRecording || isStarting}
                className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 enabled:hover:bg-indigo-100 enabled:active:scale-95 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              >
                {isStarting ? "Switching..." : "Switch camera"}
              </button>

              <button
                type="button"
                onClick={stopCamera}
                disabled={isStarting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 enabled:hover:bg-gray-100 enabled:active:scale-95 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
              >
                Stop camera
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => startCamera()}
              disabled={isStarting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 enabled:hover:bg-indigo-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isStarting ? "Starting..." : "Start camera"}
            </button>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        {recordedUrl && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Recorded video
            </p>
            <video
              controls
              playsInline
              src={recordedUrl}
              className="aspect-video w-full rounded-xl bg-gray-900 ring-1 ring-gray-200"
            />
            <a
              href={recordedUrl}
              download={`my-video.${recordedExtension}`}
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95"
            >
              Download video
            </a>
          </div>
        )}
      </section>
    </main>
  );

}