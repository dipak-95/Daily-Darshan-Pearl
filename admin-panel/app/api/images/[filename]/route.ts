import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;
    const cwd = process.cwd();

    // Define all possible locations where the file might be hiding
    const candidates = [
        join(cwd, 'user_uploads', filename),         // Root user_uploads
        join(cwd, 'public', 'uploads', filename),    // Standard public/uploads
        join(cwd, 'uploads', filename),              // Root uploads
        join('/tmp', filename),                      // Temp dir (fallback)
    ];

    let foundPath = null;
    let debugScan = [];

    // Hunt for the file
    for (const p of candidates) {
        const exists = existsSync(p);
        debugScan.push({ path: p, exists });
        if (exists) {
            foundPath = p;
            break;
        }
    }

    if (!foundPath) {
        // Debugging: List contents of root to see what's actually there
        let rootListing: string[] = [];
        try { rootListing = await readdir(cwd); } catch (e: any) { rootListing = [e.message]; }

        return NextResponse.json({
            error: 'File not found in any candidate path',
            candidates: debugScan,
            cwd: cwd,
            rootListing: rootListing.slice(0, 50)
        }, { status: 404 });
    }

    try {
        const fileBuffer = await readFile(foundPath);

        // Determine content type
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        const types: any = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'gif': 'image/gif',
            'webp': 'image/webp', 'mp4': 'video/mp4'
        };
        if (types[ext || '']) contentType = types[ext || ''];

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': fileBuffer.length.toString(),
                'Access-Control-Allow-Origin': '*', // CORS for APK
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Read Error', details: error.message }, { status: 500 });
    }
}
