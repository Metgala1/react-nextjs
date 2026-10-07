import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '@/lib/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function GET(request: Request) {
    const session = await requireAuth();

    if (session.user.id !== 1) {
        return NextResponse.json(
            { message: 'Only Roger can download this file' },
            { status: 401 }
        );
    }

    const filename = 'video.mp4';
    const filePath = join(__dirname, filename);

    try {
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'File not found', path: filePath },
                { status: 404 }
            );
        }

        const fileBuffer = await readFile(filePath);

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': 'application/mp4',
                'Content-Disposition': 'attachment; filename="video.mp4"'
            }
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to read the file.' },
            { status: 500 }
        );
    }
}