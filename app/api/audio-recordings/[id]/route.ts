import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const recording = await prisma.recording.findUnique({
        where: { id },
        select: { data: true, mimeType: true },
    });

    if (!recording) {
        return NextResponse.json({ error: "Recording not found." }, { status: 404 });
    }

    const data = recording.data;
    const total = data.length;

    const baseHeaders = {
        "Content-Type": recording.mimeType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
    };

    const rangeHeader = request.headers.get("range");
    const match = rangeHeader ? /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim()) : null;

    if (match) {
        let start: number;
        let end: number;

        if (match[1] === "" && match[2] !== "") {
            // Suffix range: "bytes=-500" means the last 500 bytes
            start = Math.max(total - Number(match[2]), 0);
            end = total - 1;
        } else {
            start = Number(match[1]);
            end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
        }

        if (Number.isNaN(start) || start >= total || start > end) {
            return new NextResponse(null, {
                status: 416,
                headers: { "Content-Range": `bytes */${total}` },
            });
        }

        const chunk = data.subarray(start, end + 1);

        return new NextResponse(chunk, {
            status: 206,
            headers: {
                ...baseHeaders,
                "Content-Range": `bytes ${start}-${end}/${total}`,
                "Content-Length": String(chunk.length),
            },
        });
    }

    return new NextResponse(data, {
        headers: { ...baseHeaders, "Content-Length": String(total) },
    });
}