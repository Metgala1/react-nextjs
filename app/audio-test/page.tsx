"use client";

import { useRef, useState, useEffect } from "react";

type Track = {
    title: string;
    id: number;
    artist: string;
    streamUrl: string;
};

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getFileName(url: string): string {
    const last = url.split("/").pop() ?? url;

    try {
        return decodeURIComponent(last);
    } catch {
        return last;
    }
}

export default function AudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    // Set to true when the user switches tracks, so the new track starts playing
    const shouldAutoPlay = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [tracks, setTracks] = useState<Track[] | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    const currentTrack = tracks?.[currentTrackIndex];
    const canSkip = (tracks?.length ?? 0) > 1;

    // Load the track list
    useEffect(() => {
        let isMounted = true;

        async function loadTracks() {
            try {
                const response = await fetch("/api/tracks");

                if (!response.ok) {
                    return;
                }

                const data: Track[] = await response.json();

                if (isMounted) {
                    setTracks(data ?? null);
                }
            } catch (error) {
                console.error("Failed to load tracks:", error);
            }
        }

        void loadTracks();

        return () => {
            isMounted = false;
        };
    }, []);

    // Start playing after the user switches tracks
    useEffect(() => {
        if (!shouldAutoPlay.current) return;
        shouldAutoPlay.current = false;

        const audio = audioRef.current;
        if (!audio) return;

        audio.play().catch((error) => {
            console.error("Could not play the selected track:", error);
        });
    }, [currentTrackIndex]);

    const progress =
        duration > 0
            ? Math.min((currentTime / duration) * 100, 100)
            : 0;

    const remaining = duration > 0 ? Math.max(duration - currentTime, 0) : 0;

    // What the user sees and hears: 0 while muted
    const displayVolume = isMuted ? 0 : volume;

    async function handlePlayPause() {
        const audio = audioRef.current;

        if (!audio || !currentTrack) return;

        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.error("Audio playback failed:", error);
            }
        } else {
            audio.pause();
        }
    }

    function changeTrack(newIndex: number) {
        shouldAutoPlay.current = true;
        // Reset so the bar doesn't show the previous song's values
        setCurrentTime(0);
        setDuration(0);
        setCurrentTrackIndex(newIndex);
    }

    function handleNext() {
        if (!tracks || tracks.length < 2) return;
        changeTrack((currentTrackIndex + 1) % tracks.length);
    }

    function handlePrevious() {
        if (!tracks || tracks.length < 2) return;
        changeTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
    }

    function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const audio = audioRef.current;
        const newVolume = Number(event.target.value);

        setVolume(newVolume);

        // Moving the slider while muted should unmute
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
            if (audio) audio.muted = false;
        }

        if (audio) {
            audio.volume = newVolume;
        }
    }

    function handleMuteToggle() {
        const audio = audioRef.current;

        if (!audio) return;

        if (isMuted) {
            // If the volume was dragged to 0 before, give unmute something to restore
            if (volume === 0) {
                setVolume(0.5);
                audio.volume = 0.5;
            }
            audio.muted = false;
            setIsMuted(false);
        } else {
            audio.muted = true;
            setIsMuted(true);
        }
    }

    function handleSeek(event: React.MouseEvent) {
        const audio = audioRef.current;
        const progressBar = progressRef.current;

        if (!audio || !progressBar || !Number.isFinite(audio.duration)) {
            return;
        }
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;

        const fraction = Math.max(0, Math.min(clickPosition / rect.width, 1));

        audio.currentTime = fraction * audio.duration;
    }

    const details = [
        {
            label: "Track",
            value: tracks ? `${currentTrackIndex + 1} / ${tracks.length}` : "—",
        },
        { label: "Artist", value: currentTrack?.artist ?? "—" },
        { label: "Elapsed", value: formatTime(currentTime) },
        { label: "Remaining", value: `-${formatTime(remaining)}` },
        { label: "Length", value: formatTime(duration) },
        { label: "Progress", value: `${Math.round(progress)}%` },
    ];

    const skipButtonClass =
        "flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-300 disabled:active:scale-100";

    return (
        <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900 p-7 shadow-2xl shadow-black/30">
            <audio
                ref={audioRef}
                src={currentTrack?.streamUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
                onLoadedMetadata={(event) => {
                    const audio = event.currentTarget;

                    if (Number.isFinite(audio.duration)) {
                        setDuration(audio.duration);
                    }
                }}
                onTimeUpdate={(event) => {
                    setCurrentTime(event.currentTarget.currentTime);
                }}
                onError={() => {
                    setIsPlaying(false);
                    console.error("Audio failed to load:", currentTrack?.streamUrl);
                }}
            />

            <div className="flex flex-col items-center">
                {/* Status pill */}
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${
                            isPlaying
                                ? "animate-pulse bg-emerald-400"
                                : "bg-slate-500"
                        }`}
                    />
                    {isPlaying ? "Now Playing" : "Paused"}
                </span>

                {/* Album art */}
                <div
                    className={`mb-6 flex h-44 w-44 items-center justify-center rounded-3xl border border-white/10 bg-indigo-600 text-white shadow-xl shadow-black/40 transition-transform duration-700 ease-out ${
                        isPlaying ? "scale-105" : "scale-100"
                    }`}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-20 w-20"
                    >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </div>

                {/* Title and artist */}
                <div className="mb-6 w-full text-center">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-white">
                        {currentTrack?.title ?? "Loading track…"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-400">
                        {currentTrack?.artist ?? "—"}
                    </p>
                </div>

                {/* Progress */}
                <div className="w-full">
                    <div
                        ref={progressRef}
                        onClick={handleSeek}
                        role="progressbar"
                        aria-label="Playback progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress)}
                        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                        className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/10"
                    >
                        <div
                            className="h-full rounded-full bg-indigo-400 transition-[width] duration-200 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-4 ring-indigo-400/20 transition-[left] duration-200 ease-linear"
                            style={{ left: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-3 flex justify-between text-xs font-medium tabular-nums text-slate-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>-{formatTime(remaining)}</span>
                    </div>
                </div>

                {/* Controls: previous / play-pause / next */}
                <div className="mt-6 flex items-center gap-5">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={!canSkip}
                        aria-label="Previous track"
                        className={skipButtonClass}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                            <path d="M18 5v14l-9-7z" />
                            <rect x="5" y="5" width="2.5" height="14" rx="1" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handlePlayPause}
                        disabled={!currentTrack}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className="group flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 ring-4 ring-white/10 transition-all duration-300 hover:scale-105 hover:bg-slate-100 focus:outline-none focus-visible:ring-indigo-400/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                                <rect x="14" y="5" width="4" height="14" rx="1.2" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canSkip}
                        aria-label="Next track"
                        className={skipButtonClass}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                            <path d="M6 5v14l9-7z" />
                            <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
                        </svg>
                    </button>
                </div>

                {/* Volume */}
                <div className="mt-7 flex w-full items-center gap-3 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {/* Mute toggle */}
                    <button
                        type="button"
                        onClick={handleMuteToggle}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        aria-pressed={isMuted}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                            isMuted
                                ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
                            {displayVolume > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
                            {displayVolume > 0.5 && <path d="M18.5 5.5a9 9 0 0 1 0 13" />}
                            {displayVolume === 0 && <path d="m16 9 5 6M21 9l-5 6" />}
                        </svg>
                    </button>

                    {/* Slider */}
                    <label className="relative flex h-4 flex-1 items-center">
                        <span className="sr-only">Volume</span>
                        {/* Track */}
                        <span className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />
                        {/* Fill */}
                        <span
                            className={`absolute left-0 h-1.5 rounded-full transition-colors ${
                                isMuted ? "bg-slate-500" : "bg-indigo-400"
                            }`}
                            style={{ width: `calc(8px + (100% - 16px) * ${displayVolume})` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={displayVolume}
                            onChange={handleVolumeChange}
                            aria-label="Volume"
                            className="relative h-4 w-full cursor-pointer appearance-none bg-transparent focus:outline-none
                                [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:bg-transparent
                                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-indigo-400/20 [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110
                                [&::-moz-range-track]:h-4 [&::-moz-range-track]:bg-transparent
                                [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white
                                focus-visible:[&::-webkit-slider-thumb]:ring-indigo-400/60"
                        />
                    </label>

                    <span className="w-9 text-right tabular-nums">
                        {Math.round(displayVolume * 100)}%
                    </span>
                </div>

                {/* Track details */}
                <dl className="mt-6 grid w-full grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-5">
                    {details.map((item) => (
                        <div key={item.label} className="min-w-0">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {item.label}
                            </dt>
                            <dd className="mt-0.5 truncate text-sm font-medium tabular-nums text-slate-200">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                    <div className="col-span-2 min-w-0">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            File
                        </dt>
                        <dd className="mt-0.5 truncate text-sm font-medium text-slate-200">
                            {currentTrack ? getFileName(currentTrack.streamUrl) : "—"}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}