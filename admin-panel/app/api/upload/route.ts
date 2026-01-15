import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Use a persistent folder in the project root, NOT in public/ (which acts as static cache source)
        // 'user_uploads' will be created at the root of the running application
        const uploadDir = join(process.cwd(), 'user_uploads');
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate clean unique filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${safeName}`;

        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        console.log(`[Upload Success] File saved to: ${path}`);

        // Return URL that points to our custom image handler
        const url = `/api/images/${filename}`;
        return NextResponse.json({ success: true, url });
    } catch (e: any) {
        console.error('[Upload Failed]', e);
        return NextResponse.json({ success: false, message: e.message || 'Server upload failed' }, { status: 500 });
    }
}
