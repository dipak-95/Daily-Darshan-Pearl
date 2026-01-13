import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TempleModel from '@/models/Temple';
import PoonamModel from '@/models/Poonam';
import GrahanModel from '@/models/Grahan';

export async function GET() {
    await connectDB();
    const templeCount = await TempleModel.countDocuments();
    const poonamCount = await PoonamModel.countDocuments();
    const grahanCount = await GrahanModel.countDocuments();

    return NextResponse.json({
        templeCount,
        poonamCount,
        grahanCount
    });
}
