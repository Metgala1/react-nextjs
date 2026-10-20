import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // always show the latest recordings

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function RecordingsPage() {
    const recordings = await prisma.recording.findMany({
        orderBy: { createdAt: "desc" },
        // Don't select `data`, or every audio file loads into memory
        select: {
            id: true,
            title: true,
            sizeBytes: true,
            createdAt: true,
        },
    });

    recordings.forEach(r => {
        console.log(r.id)
    })

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto w-full max-w-2xl">
                <header className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                        🎧
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">My Recordings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {recordings.length}{" "}
                        {recordings.length === 1 ? "recording" : "recordings"}
                    </p>
                </header>

                {recordings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <p className="font-semibold text-gray-900">No recordings yet</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Saved recordings will show up here.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {recordings.map((recording, index) => (
                            <li
                                key={recording.id}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="mb-3 flex items-baseline justify-between gap-4">
                                    <h2 className="truncate font-semibold text-gray-900">
                                        {recording.title?.trim() ||
                                            `Recording #${recordings.length - index}`}
                                    </h2>
                                    <span className="shrink-0 text-xs text-gray-500">
                                        {formatBytes(recording.sizeBytes)}
                                    </span>
                                </div>

                                <audio
                                    controls
                                    preload="none"
                                    src={`/api/audio-recordings/${recording.id}`}
                                    className="w-full"
                                />

                                <p className="mt-2 text-xs text-gray-400">
                                    {recording.createdAt.toLocaleString("en-US", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}