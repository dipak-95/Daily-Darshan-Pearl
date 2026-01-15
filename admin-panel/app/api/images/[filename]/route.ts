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

    // Look in path relative to CWD
    const publicPath = join(process.cwd(), 'public/uploads', filename);
    const cwd = process.cwd();

    // Try to find the file
    if (!existsSync(publicPath)) {
        let folderContents: string[] = [];
        try {
            const dir = dirname(publicPath);
            if (existsSync(dir)) {
                folderContents = await readdir(dir);
            } else {
                folderContents = ['Directory does not exist'];
            }
        } catch (e: any) {
            folderContents = [`Error listing directory: ${e.message}`];
        }

        return NextResponse.json({
            error: 'File not found',
            pathTried: publicPath,
            cwd: cwd,
            folderContents: folderContents.slice(0, 50)
        }, { status: 404 });
    }

    try {
        const fileBuffer = await readFile(publicPath);

        // Determine content type
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';

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
