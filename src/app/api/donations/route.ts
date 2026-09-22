import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { Donation } from '@/models/Donation';
import { numberToWordsMarathi } from '@/lib/numberToWordsMarathi';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    await connectToDatabase();

    const query: any = { year };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { donorPhone: { $regex: search, $options: 'i' } },
        { receiptNo: { $regex: search, $options: 'i' } },
        { buildingFlat: { $regex: search, $options: 'i' } },
      ];
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    const formatted = donations.map((d) => {
      const obj: any = d.toObject();
      obj.id = d._id.toString();
      return obj;
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching donations from MongoDB Atlas:', error);
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

    // Auto-generate sequential receipt number
    const count = await Donation.countDocuments({ mandalId: mandal._id, year });
    const padded = String(count + 101).padStart(5, '0');
    const receiptNo = `MB-${year}-${padded}`;

    const numericAmount = parseFloat(body.amount) || 0;
    const amountInWords = numberToWordsMarathi(numericAmount);

    const newDonation = await Donation.create({
      mandalId: mandal._id,
      receiptNo,
      donorName: body.donorName,
      donorPhone: body.donorPhone || '',
      buildingFlat: body.buildingFlat || '',
      amount: numericAmount,
      amountInWords,
      paymentMode: body.paymentMode || 'CASH',
      isInKind: Boolean(body.isInKind),
      inKindDetails: body.inKindDetails || '',
      collectorName: body.collectorName || 'न्यू युवा बॉईज कार्यकर्ता',
      year,
      status: body.status || 'PAID',
      pledgeFollowUpDate: body.pledgeDate ? new Date(body.pledgeDate) : undefined,
      notes: body.notes || '',
      createdAt: new Date(),
    });

    // Update Mandal cash/bank balance
    if (newDonation.status === 'PAID') {
      if (newDonation.paymentMode === 'CASH') {
        await Mandal.findByIdAndUpdate(mandal._id, { $inc: { cashInHand: newDonation.amount } });
      } else {
        await Mandal.findByIdAndUpdate(mandal._id, { $inc: { bankBalance: newDonation.amount } });
      }
    }

    const obj: any = newDonation.toObject();
    obj.id = newDonation._id.toString();

    return NextResponse.json(obj, { status: 201 });
  } catch (error) {
    console.error('Error recording donation in MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }
}
