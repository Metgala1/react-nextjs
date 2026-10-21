"use client";

import { useCallback, useEffect, useState } from "react";

type VideoItem = {
    id: string;
    title: string | null;
    mimeType: string;
    sizeBytes: number;
    durationMs: number | null;
    createdAt: string;
    url: string | null;
};

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms: number) {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// Only one video plays at a time
function pauseOthers(event: React.SyntheticEvent<HTMLVideoElement>) {
    document.querySelectorAll("video").forEach((video) => {
        if (video !== event.currentTarget) video.pause();
    });
}

function VideoCard({ video, number }: { video: VideoItem; number: number }) {
    const [failed, setFailed] = useState(false);

    const title = video.title?.trim() || `Video #${number}`;
    const format = video.mimeType.split("/")[1] ?? "video";

    return (
        <li className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="relative aspect-video w-full bg-gray-900">
                {video.url && !failed ? (
                    <video
                        controls
                        playsInline
                        preload="metadata"
                        src={video.url}
                        onPlay={pauseOthers}
                        onError={() => setFailed(true)}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-gray-400">
                        <span className="text-4xl">🎞️</span>
                        <p className="text-sm font-medium">
                            {failed
                                ? "Could not load this video. Try refreshing."
                                : "Video unavailable"}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">{title}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {formatDate(video.createdAt)} · {formatBytes(video.sizeBytes)}
                        {video.durationMs ? ` · ${formatDuration(video.durationMs)}` : ""}
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase text-gray-600">
                    {format}
                </span>
            </div>
        </li>
    );
}

function SkeletonCard() {
    return (
        <li className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="aspect-video w-full bg-gray-200" />
            <div className="space-y-2 p-4">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
        </li>
    );
}

export default function VideosPage() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVideos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/videos", { cache: "no-store" });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.error ?? "Failed to load videos.");
            }

            const body = await response.json();
            setVideos(body.videos);
        } catch (err) {
            console.error("Could not load videos:", err);
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                            🎬
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Videos</h1>
                            <p className="text-sm text-gray-500">
                                {isLoading
                                    ? "Loading..."
                                    : `${videos.length} saved ${
                                          videos.length === 1 ? "video" : "videos"
                                      }`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loadVideos}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        Refresh
                    </button>
                </header>

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600"
                    >
                        {error}
                    </p>
                )}

                {isLoading && (
                    <ul className="grid gap-6 sm:grid-cols-2">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </ul>
                )}

                {!isLoading && !error && videos.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <div className="mb-3 text-4xl">🎥</div>
                        <p className="font-semibold text-gray-900">No videos yet</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Record and upload a video to see it here.
                        </p>
                    </div>
                )}

                {!isLoading && videos.length > 0 && (
                    <ul className="grid gap-6 sm:grid-cols-2">
                        {videos.map((video, index) => (
                            <VideoCard
                                // The URL changes on every refresh, so a failed card gets a fresh start
                                key={`${video.id}-${video.url}`}
                                video={video}
                                number={videos.length - index}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}