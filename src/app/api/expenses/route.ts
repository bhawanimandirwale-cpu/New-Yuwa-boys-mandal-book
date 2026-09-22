import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { Expense } from '@/models/Expense';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    await connectToDatabase();

    const query: any = { year };
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    const formatted = expenses.map((e) => {
      const obj: any = e.toObject();
      obj.id = e._id.toString();
      return obj;
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching expenses from MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let mandal = await Mandal.findOne();
    if (!mandal) {
      mandal = await Mandal.create({
        name: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
        activeYear: body.year || 2026,
      });
    }

    const year = body.year ? parseInt(body.year) : mandal.activeYear || 2026;

    // Sequential voucher number
    const count = await Expense.countDocuments({ mandalId: mandal._id, year });
    const padded = String(count + 1).padStart(3, '0');
    const voucherNo = `VCH-${year}-${padded}`;

    const numAmount = parseFloat(body.amount) || 0;

    const newExpense = await Expense.create({
      mandalId: mandal._id,
      voucherNo,
      title: body.title,
      category: body.category || 'MISC',
      amount: numAmount,
      paidTo: body.paidTo,
      paidBy: body.paidBy || 'भूषण चौधरी (खजिनदार)',
      billUrl: body.billUrl || '',
      paymentMode: body.paymentMode || 'CASH',
      date: body.date ? new Date(body.date) : new Date(),
      year,
      approvedBy: body.approvedBy || 'निलेश पाटील (अध्यक्ष)',
      status: body.status || 'APPROVED',
      createdAt: new Date(),
    });

    // Deduct from mandal cash or bank if approved
    if (newExpense.status === 'APPROVED') {
      if (mandal.cashInHand >= numAmount) {
        await Mandal.findByIdAndUpdate(mandal._id, { $inc: { cashInHand: -numAmount } });
      } else {
        await Mandal.findByIdAndUpdate(mandal._id, { $inc: { bankBalance: -numAmount } });
      }
    }

    const obj: any = newExpense.toObject();
    obj.id = newExpense._id.toString();

    return NextResponse.json(obj, { status: 201 });
  } catch (error) {
    console.error('Error creating expense in MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
