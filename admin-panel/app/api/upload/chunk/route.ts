import { NextResponse } from 'next/server';
import { appendFile, writeFile, mkdir, rename, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('chunk') as File;
        const index = parseInt(formData.get('index') as string);
        const total = parseInt(formData.get('total') as string);
        const fileId = formData.get('fileId') as string;
        const originalName = formData.get('fileName') as string;

        if (!file) return NextResponse.json({ error: 'No chunk' }, { status: 400 });

        // Temp dir for chunks
        const tempDir = join(process.cwd(), 'temp_uploads');
        await mkdir(tempDir, { recursive: true });

        const tempFilePath = join(tempDir, `${fileId}.tmp`);
        const buffer = Buffer.from(await file.arrayBuffer());

        if (index === 0) {
            // Start fresh
            await writeFile(tempFilePath, buffer);
        } else {
            // Append
            await appendFile(tempFilePath, buffer);
        }

        // If last chunk, finalize
        if (index === total - 1) {
            const finalDir = join(process.cwd(), 'user_uploads');
            await mkdir(finalDir, { recursive: true });

            const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const finalFilename = `${uniqueSuffix}-${safeName}`;
            const finalPath = join(finalDir, finalFilename);

            await rename(tempFilePath, finalPath);

            return NextResponse.json({
                success: true,
                completed: true,
                url: `/api/images/${finalFilename}`
            });
        }

        return NextResponse.json({ success: true, completed: false });

    } catch (e: any) {
        console.error('Chunk upload error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
