import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { Donation } from '@/models/Donation';
import { Expense } from '@/models/Expense';
import { PermitDocument } from '@/models/Document';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    let mandal = await Mandal.findOne();

    if (!mandal) {
      // Auto-create default primary Mandal if first launch
      mandal = await Mandal.create({
        name: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
        tagline: 'न्यू युवा बॉईज - भव्य सार्वजनिक गणेशोत्सव २०२६',
        registrationNo: 'महा/केऱ्हाळे/२०२६',
        establishedYear: 2012,
        address: 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)',
        city: 'केऱ्हाळे बु.',
        upiId: process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || '9923092340@ybl',
        helplinePhone: process.env.NEXT_PUBLIC_DEFAULT_PHONE || '7499085045',
        activeYear: 2026,
        inviteCode: 'NYB026',
        cashInHand: 42500,
        bankBalance: 125000,
        bankName: 'स्टेट बँक ऑफ इंडिया (केऱ्हाळे शाखा)',
        accountNumber: '३९४८२९१०३९४',
        ifscCode: 'SBIN0001234',
        presidentName: 'पार्थ पाटील (अध्यक्ष)',
        vicePresidentName: 'कुश पाटील (उपअध्यक्ष)',
        secretaryName: 'श्री. सचिन तायडे (सचिव)',
        treasurerName: 'कृष्णा महाजन (खजिनदार)',
      });
    } else {
      let needSave = false;
      if (mandal.presidentName !== 'पार्थ पाटील (अध्यक्ष)') {
        mandal.presidentName = 'पार्थ पाटील (अध्यक्ष)';
        needSave = true;
      }
      if (mandal.vicePresidentName !== 'कुश पाटील (उपअध्यक्ष)') {
        mandal.vicePresidentName = 'कुश पाटील (उपअध्यक्ष)';
        needSave = true;
      }
      if (mandal.treasurerName !== 'कृष्णा महाजन (खजिनदार)') {
        mandal.treasurerName = 'कृष्णा महाजन (खजिनदार)';
        needSave = true;
      }
      if (needSave) {
        await mandal.save();
      }
    }

    // Financial aggregates via MongoDB aggregation pipeline
    const [donationsAgg] = await Donation.aggregate([
      { $match: { mandalId: mandal._id, status: 'PAID' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const [pledgedAgg] = await Donation.aggregate([
      { $match: { mandalId: mandal._id, status: 'PLEDGED' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const [expensesAgg] = await Expense.aggregate([
      { $match: { mandalId: mandal._id, status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCollected = donationsAgg?.total || 0;
    const totalPledged = pledgedAgg?.total || 0;
    const totalExpenses = expensesAgg?.total || 0;
    const netBalance = totalCollected - totalExpenses;

    const mandalJson: any = mandal.toObject();
    mandalJson.id = mandal._id.toString();
    mandalJson.presidentName = mandal.presidentName || 'पार्थ पाटील (अध्यक्ष)';
    mandalJson.vicePresidentName = mandal.vicePresidentName || 'कुश पाटील (उपअध्यक्ष)';
    mandalJson.treasurerName = mandal.treasurerName || 'कृष्णा महाजन (खजिनदार)';

    return NextResponse.json({
      mandal: mandalJson,
      stats: {
        totalCollected,
        totalPledged,
        totalExpenses,
        netBalance,
        cashInHand: mandal.cashInHand,
        bankBalance: mandal.bankBalance,
        donationCount: donationsAgg?.count || 0,
        pledgedCount: pledgedAgg?.count || 0,
        expenseCount: expensesAgg?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching mandal data from MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const inviteCode = (body.name.substring(0, 3) + Math.floor(100 + Math.random() * 900)).toUpperCase();

    const newMandal = await Mandal.create({
      name: body.name,
      city: body.city || 'केऱ्हाळे बु.',
      address: body.address || 'केऱ्हाळे बुद्रुक (Kerhale Bk.)',
      upiId: body.upiId || process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || '9923092340@ybl',
      helplinePhone: body.helplinePhone || process.env.NEXT_PUBLIC_DEFAULT_PHONE || '7499085045',
      inviteCode,
      activeYear: 2026,
    });

    return NextResponse.json(newMandal, { status: 201 });
  } catch (error) {
    console.error('Error creating mandal:', error);
    return NextResponse.json({ error: 'Failed to create mandal' }, { status: 500 });
  }
}
