import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const whereClause: any = { year };

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const expenses = await db.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mandal = await db.mandal.findFirst();

    if (!mandal) {
      return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
    }

    // Auto-generate voucher number
    const count = await db.expense.count();
    const padded = String(count + 1).padStart(3, '0');
    const voucherNo = `VCH-${body.year || 2026}-${padded}`;

    const newExpense = await db.expense.create({
      data: {
        mandalId: mandal.id,
        title: body.title,
        category: body.category || 'MISC',
        amount: parseFloat(body.amount) || 0,
        paidTo: body.paidTo,
        paidBy: body.paidBy,
        billUrl: body.billUrl || null,
        voucherNo,
        year: body.year ? parseInt(body.year) : 2026,
        date: body.date ? new Date(body.date) : new Date(),
        approvedBy: body.approvedBy || null,
        status: body.status || 'APPROVED',
      },
    });

    // If approved, deduct from mandal cash or bank
    if (newExpense.status === 'APPROVED') {
      if (mandal.cashInHand >= newExpense.amount) {
        await db.mandal.update({
          where: { id: mandal.id },
          data: { cashInHand: { decrement: newExpense.amount } },
        });
      } else {
        await db.mandal.update({
          where: { id: mandal.id },
          data: { bankBalance: { decrement: newExpense.amount } },
        });
      }
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
