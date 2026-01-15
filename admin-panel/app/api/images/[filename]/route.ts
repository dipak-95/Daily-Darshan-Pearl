
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
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

    // Look in both standard locations to be safe
    console.log('Serving Image Request:', filename, 'CWD:', process.cwd());
    const publicPath = join(process.cwd(), 'public/uploads', filename);

    // Try to find the file
    if (!existsSync(publicPath)) {
        console.error(`File not found at: ${publicPath}`);
        return new NextResponse('File not found', { status: 404 });
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
            },
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
