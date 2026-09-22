import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { Mandal } from '@/models/Mandal';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { receiptNo: id }];
    } else {
      query.receiptNo = id;
    }

    const donation = await Donation.findOne(query).populate('mandalId');

    if (!donation) {
      return NextResponse.json({ error: 'पावती सापडली नाही.' }, { status: 404 });
    }

    const obj: any = donation.toObject();
    obj.id = donation._id.toString();
    obj.mandal = obj.mandalId;

    return NextResponse.json(obj);
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await connectToDatabase();

    const existing = await Donation.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const wasPledged = existing.status === 'PLEDGED';
    const newStatus = body.status || existing.status;

    existing.status = newStatus;
    if (body.paymentMode) existing.paymentMode = body.paymentMode;
    await existing.save();

    // If marked as paid, increment mandal balance
    if (wasPledged && newStatus === 'PAID') {
      if (existing.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: existing.amount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: existing.amount } });
      }
    }

    const obj: any = existing.toObject();
    obj.id = existing._id.toString();

    return NextResponse.json(obj);
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}
