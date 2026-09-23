import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Expense } from '@/models/Expense';
import { Mandal } from '@/models/Mandal';
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
      query.$or = [{ _id: id }, { voucherNo: id }];
    } else {
      query.voucherNo = id;
    }

    const expense = await Expense.findOne(query).populate('mandalId');
    if (!expense) {
      return NextResponse.json({ error: 'खर्च व्हाऊचर सापडले नाही.' }, { status: 404 });
    }

    const obj: any = expense.toObject();
    obj.id = expense._id.toString();

    return NextResponse.json(obj);
  } catch (error: any) {
    console.error('Error fetching expense:', error);
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

    const existing = await Expense.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'खर्च व्हाऊचर सापडले नाही.' }, { status: 404 });
    }

    const oldAmount = existing.amount;
    const oldMode = existing.paymentMode;
    const oldStatus = existing.status;

    // Update editable fields
    if (body.title !== undefined) existing.title = body.title.trim();
    if (body.category !== undefined) existing.category = body.category;
    if (body.paidTo !== undefined) existing.paidTo = body.paidTo.trim();
    if (body.paidBy !== undefined) existing.paidBy = body.paidBy.trim();
    if (body.billUrl !== undefined) existing.billUrl = body.billUrl.trim();
    if (body.paymentMode !== undefined) existing.paymentMode = body.paymentMode;
    if (body.approvedBy !== undefined) existing.approvedBy = body.approvedBy.trim();
    if (body.status !== undefined) existing.status = body.status;
    if (body.date !== undefined && !isNaN(new Date(body.date).getTime())) {
      existing.date = new Date(body.date);
    }

    if (body.amount !== undefined) {
      const numAmount = parseFloat(body.amount);
      if (!isNaN(numAmount) && numAmount >= 0) {
        existing.amount = numAmount;
      }
    }

    await existing.save();

    // Smart Mandal Ledger balance adjustment:
    // 1. Revert previous expense deduction if it was APPROVED
    if (oldStatus === 'APPROVED') {
      if (oldMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: oldAmount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: oldAmount } });
      }
    }

    // 2. Apply new expense deduction if currently APPROVED
    if (existing.status === 'APPROVED') {
      if (existing.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: -existing.amount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: -existing.amount } });
      }
    }

    const obj: any = existing.toObject();
    obj.id = existing._id.toString();

    return NextResponse.json(obj);
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const existing = await Expense.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'खर्च व्हाऊचर सापडले नाही.' }, { status: 404 });
    }

    // If it was APPROVED, restore the deducted amount back to mandal
    if (existing.status === 'APPROVED') {
      if (existing.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { cashInHand: existing.amount } });
      } else {
        await Mandal.findByIdAndUpdate(existing.mandalId, { $inc: { bankBalance: existing.amount } });
      }
    }

    await Expense.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'खर्च व्हाऊचर यशस्वीरित्या हटवण्यात आले.' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete expense' }, { status: 500 });
  }
}
