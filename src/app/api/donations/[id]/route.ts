import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { Mandal } from '@/models/Mandal';
import { numberToWordsMarathi } from '@/lib/numberToWordsMarathi';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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

    const oldAmount = existing.amount;
    const oldMode = existing.paymentMode;
    const oldStatus = existing.status;

    // Update editable fields
    if (body.donorName !== undefined) existing.donorName = body.donorName.trim();
    if (body.donorPhone !== undefined) existing.donorPhone = body.donorPhone.trim();
    if (body.buildingFlat !== undefined) existing.buildingFlat = body.buildingFlat.trim();
    if (body.notes !== undefined) existing.notes = body.notes.trim();
    if (body.collectorName !== undefined) existing.collectorName = body.collectorName.trim();
    if (body.isInKind !== undefined) existing.isInKind = Boolean(body.isInKind);
    if (body.inKindDetails !== undefined) existing.inKindDetails = body.inKindDetails.trim();
    if (body.paymentMode !== undefined) existing.paymentMode = body.paymentMode;
    if (body.status !== undefined) existing.status = body.status;

    if (body.amount !== undefined) {
      const numAmount = parseFloat(body.amount);
      if (!isNaN(numAmount) && numAmount >= 0) {
        existing.amount = numAmount;
        existing.amountInWords = numberToWordsMarathi(numAmount);
      }
    }

    await existing.save();

    // Smart Mandal Ledger adjustment:
    // 1. Revert old balance impact if it was previously PAID
    if (oldStatus === 'PAID') {
      if (oldMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: -oldAmount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: -oldAmount } });
      }
    }

    // 2. Apply new balance impact if currently PAID
    if (existing.status === 'PAID') {
      if (existing.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: existing.amount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: existing.amount } });
      }
    }

    const obj: any = existing.toObject();
    obj.id = existing._id.toString();

    return NextResponse.json(obj);
  } catch (error: any) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update donation' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const existing = await Donation.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // If it was PAID, deduct its amount from cash/bank
    if (existing.status === 'PAID') {
      if (existing.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: -existing.amount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: -existing.amount } });
      }
    }

    await Donation.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'पावती यशस्वीरित्या हटवण्यात आली.' });
  } catch (error: any) {
    console.error('Error deleting donation:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete donation' }, { status: 500 });
  }
}
