import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GrahanModel from '@/models/Grahan';

export async function GET() {
    await connectDB();
    const grahans = await GrahanModel.find({});
    return NextResponse.json(grahans);
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { startDateTime, endDateTime, affectedPlaces, affectedPlacesHindi, description, descriptionHindi } = body;

        const newItem = await GrahanModel.create({
            id: crypto.randomUUID(),
            startDateTime,
            endDateTime,
            affectedPlaces,
            affectedPlacesHindi,
            description,
            descriptionHindi
        });
        return NextResponse.json(newItem);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, _id, ...updates } = body;

        const updated = await GrahanModel.findOneAndUpdate({ id: id }, updates, { new: true });
        if (updated) return NextResponse.json(updated);
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            await GrahanModel.deleteOne({ id: id });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
