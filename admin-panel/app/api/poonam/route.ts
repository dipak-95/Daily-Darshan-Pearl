import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PoonamModel from '@/models/Poonam';

export async function GET() {
    await connectDB();
    const poonams = await PoonamModel.find({});
    return NextResponse.json(poonams);
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        // Destructure to sanitize or just pass body if matched
        const { startDateTime, endDateTime, description, descriptionHindi } = body;

        const newItem = await PoonamModel.create({
            id: crypto.randomUUID(),
            startDateTime,
            endDateTime,
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

        const updated = await PoonamModel.findOneAndUpdate({ id: id }, updates, { new: true });
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
            await PoonamModel.deleteOne({ id: id });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
