import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import { tmpdir } from 'os';
import { Readable } from 'stream';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Look in system temp first (most reliable), then others as fallback
    const systemTemp = join(tmpdir(), 'spectral_uploads', filename);
    const candidates = [
        systemTemp,
        join(process.cwd(), 'user_uploads', filename),
        join(process.cwd(), 'public', 'uploads', filename),
    ];

    let filePath: string | null = null;
    for (const p of candidates) {
        if (existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        return NextResponse.json({ error: 'File not found', searched: candidates }, { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const ext = filename.split('.').pop()?.toLowerCase();

    let contentType = 'application/octet-stream';
    const types: any = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
        'png': 'image/png', 'gif': 'image/gif',
        'webp': 'image/webp', 'mp4': 'video/mp4'
    };
    if (types[ext || '']) contentType = types[ext || ''];

    // Handle Video Streaming (Partial Content)
    if (contentType.startsWith('video/')) {
        const range = request.headers.get('range');
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const fileStream = createReadStream(filePath, { start, end });

            // Convert to web readable stream for Next.js
            const stream = new ReadableStream({
                start(controller) {
                    fileStream.on('data', chunk => controller.enqueue(chunk));
                    fileStream.on('end', () => controller.close());
                    fileStream.on('error', err => controller.error(err));
                }
            });

            return new NextResponse(stream as any, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize.toString(),
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }

    // Regular file serving (Images)
    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': contentType,
            'Content-Length': fileSize.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate', // Prevent caching during debug
            'Access-Control-Allow-Origin': '*',
        },
    });
}
