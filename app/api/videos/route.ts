import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    VIDEO_BUCKET,
    createVideoPath,
    deleteVideo,
    getVideoUrl,
    uploadVideoToStorage,
    validateVideo,
    getVideoUrls
} from "@/lib/supabase/videos";

export const runtime = "nodejs";

export async function POST(request: Request) {
    // Your admin client bypasses RLS, so check auth BEFORE using it:
    // const session = await getSession();
    // if (!session) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    let storagePath: string | null = null;
    let uploaded = false;
    let recordSaved = false;

    try {
        const formData = await request.formData();
        const video = formData.get("video");

        if (!(video instanceof File)) {
            return NextResponse.json(
                { error: "No video file provided." },
                { status: 400 }
            );
        }

        // 1. Validate the file
        const validation = validateVideo(video);

        if (!validation.ok) {
            return NextResponse.json(
                { error: validation.message },
                { status: 400 }
            );
        }

        const { contentType, extension } = validation;
        storagePath = createVideoPath(extension);

        // 2. Upload first. If this fails, nothing exists in the database yet.
        const upload = await uploadVideoToStorage(video, storagePath, contentType);

        if (!upload.success) {
            return NextResponse.json({ error: upload.message }, { status: 502 });
        }

        uploaded = true;

        // 3. Save the row only now that the file is safely in storage
        const record = await prisma.video.create({
            data: {
                bucket: VIDEO_BUCKET,
                storagePath,
                mimeType: contentType,
                sizeBytes: video.size,
            },
        });

        recordSaved = true;

        const url = await getVideoUrl(storagePath);

        return NextResponse.json(
            { id: record.id, path: storagePath, url },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to upload video:", error);

        // The file made it to storage but the database save failed,
        // so remove the file to avoid an orphan with no row pointing at it.
        if (uploaded && !recordSaved && storagePath) {
            await deleteVideo(storagePath);
        }

        return NextResponse.json(
            { error: "Failed to upload video" },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";

export async function GET() {
    // Check auth BEFORE using the admin client:
    // const session = await getSession();
    // if (!session) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const records = await prisma.video.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                mimeType: true,
                sizeBytes: true,
                durationMs: true,
                createdAt: true,
                storagePath: true,
            },
        });

        const urls = await getVideoUrls(records.map((record) => record.storagePath));

        // Return the signed URL, not the internal storage path
        const videos = records.map(({ storagePath, ...record }) => ({
            ...record,
            url: urls[storagePath] ?? null,
        }));

        return NextResponse.json({ videos });
    } catch (error) {
        console.error("Failed to fetch videos:", error);
        return NextResponse.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        );
    }
}