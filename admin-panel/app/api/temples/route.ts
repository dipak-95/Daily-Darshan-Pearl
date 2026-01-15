import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TempleModel from '@/models/Temple';

export async function GET() {
    try {
        await connectDB();
        // Fetch all temples, sorted by newest first
        const temples = await TempleModel.find({}).sort({ createdAt: -1 });
        return NextResponse.json(temples);
    } catch (error: any) {
        console.error("GET /api/temples Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate required fields
        if (!body.name || !body.location) {
            return NextResponse.json({ error: "Name and Location are required" }, { status: 400 });
        }

        const newTemple = await TempleModel.create({
            id: crypto.randomUUID(),
            ...body,
            // Ensure videos is initialized if not provided
            videos: body.videos || {}
        });

        return NextResponse.json(newTemple);
    } catch (e: any) {
        console.error("POST Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, _id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updated = await TempleModel.findOneAndUpdate({ id: id }, updates, { new: true });

        if (!updated) return NextResponse.json({ error: "Temple not found" }, { status: 404 });

        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await TempleModel.deleteOne({ id: id });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
