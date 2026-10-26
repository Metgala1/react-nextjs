import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/mpeg",
]);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("audio");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "No audio file provided." },
                { status: 400 }
            );
        }

        // "audio/webm;codecs=opus" -> "audio/webm"
        const mimeType = file.type.split(";")[0].trim();

        if (!ALLOWED_TYPES.has(mimeType)) {
            return NextResponse.json(
                { error: `Unsupported audio type: ${mimeType || "unknown"}` },
                { status: 415 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: "The audio file is empty." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Audio file is too large (max 10 MB)." },
                { status: 413 }
            );
        }

        const data = new Uint8Array(await file.arrayBuffer());

        const recording = await prisma.recording.create({
            data: {
                data,
                mimeType,
                sizeBytes: file.size,
            },
            // Don't send the audio bytes back in the result
            select: {
                id: true,
                mimeType: true,
                sizeBytes: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                ...recording,
                url: `/api/audio-recordings/${recording.id}`,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to save recording:", error);
        return NextResponse.json(
            { error: "Failed to save recording." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const recordings = await prisma.recording.findMany({
            orderBy: { createdAt: "desc" },
            // Never select `data` here, or every audio file loads into memory
            select: {
                id: true,
                title: true,
                mimeType: true,
                sizeBytes: true,
                durationMs: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ recordings });
    } catch (error) {
        console.error("Failed to fetch recordings:", error);
        return NextResponse.json(
            { error: "Failed to fetch recordings." },
            { status: 500 }
        );
    }
}