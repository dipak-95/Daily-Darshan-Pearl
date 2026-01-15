import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Security path traversal check
    if (filename.includes('..')) {
        return new NextResponse('Invalid filename', { status: 400 });
    }

    // Look in 'user_uploads' folder in root (matches upload route)
    const storageDir = join(process.cwd(), 'user_uploads');
    const filePath = join(storageDir, filename);

    // Try to find the file
    if (!existsSync(filePath)) {
        // Debugging info in 404 response
        let folderContents: string[] = [];
        try {
            if (existsSync(storageDir)) {
                folderContents = await readdir(storageDir);
            } else {
                folderContents = ['Directory user_uploads does not exist'];
            }
        } catch (e: any) {
            folderContents = [`Error listing directory: ${e.message}`];
        }

        return NextResponse.json({
            error: 'File not found',
            pathTried: filePath,
            cwd: process.cwd(),
            folderDebug: folderContents.slice(0, 50)
        }, { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        // Determine content type
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';
        if (ext === 'mp4') contentType = 'video/mp4'; // Added video support

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
