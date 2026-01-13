import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TempleModel from '@/models/Temple';
import { Temple } from '@/lib/types';

export async function GET() {
    try {
        await connectDB();

        // Auto-Cleanup: Remove videos older than Yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const getYYYYMMDD = (d: Date) => d.toLocaleDateString('en-CA');
        const yesterdayStr = getYYYYMMDD(yesterday);

        const temples = await TempleModel.find({});

        // Cleanup loop
        for (const doc of temples) {
            if (doc.videos) {
                // If it's a Map
                const currentVideos = doc.videos instanceof Map ? Object.fromEntries(doc.videos) : doc.videos;
                let changed = false;
                const newVideos: Record<string, any> = {};

                Object.keys(currentVideos).forEach(key => {
                    if (key >= yesterdayStr) {
                        newVideos[key] = currentVideos[key];
                    } else {
                        changed = true;
                    }
                });

                if (changed) {
                    doc.videos = newVideos;
                    await doc.save();
                }
            }
        }

        // Return fresh fetch or the modified docs
        // Mongoose docs are mutable so 'temples' is updated.
        return NextResponse.json(temples);
    } catch (error: any) {
        console.error("GET /api/temples Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, nameHindi, description, descriptionHindi, location, locationHindi, image, activeContentTypes } = body;

        const newTemple = await TempleModel.create({
            id: crypto.randomUUID(), // Maintaining 'id' field for frontend compat
            name,
            nameHindi,
            description,
            descriptionHindi,
            location,
            locationHindi,
            image,
            activeContentTypes: activeContentTypes || [],
            videos: {}
        });

        return NextResponse.json(newTemple);
    } catch (e: any) {
        console.error("POST Error:", e);
        return NextResponse.json({ error: 'Failed to create temple', details: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, _id, ...updates } = body;

        // Use 'id' (UUID) to find, not _id, consistent with frontend
        const updated = await TempleModel.findOneAndUpdate({ id: id }, updates, { new: true });

        if (updated) {
            return NextResponse.json(updated);
        }
        return NextResponse.json({ error: 'Temple not found' }, { status: 404 });
    } catch (e: any) {
        console.error("PUT Error:", e);
        return NextResponse.json({ error: 'Update failed', details: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            await TempleModel.deleteOne({ id: id });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
