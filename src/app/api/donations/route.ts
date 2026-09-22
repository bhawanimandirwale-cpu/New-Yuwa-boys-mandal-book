import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = { year };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { donorName: { contains: search } },
        { donorPhone: { contains: search } },
        { receiptNo: { contains: search } },
        { buildingFlat: { contains: search } },
      ];
    }

    const donations = await db.varganiDonation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
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

    // Auto-generate receipt number
    const count = await db.varganiDonation.count();
    const padded = String(count + 101).padStart(5, '0');
    const receiptNo = `MB-${body.year || 2026}-${padded}`;

    const newDonation = await db.varganiDonation.create({
      data: {
        mandalId: mandal.id,
        donorName: body.donorName,
        donorPhone: body.donorPhone || '',
        buildingFlat: body.buildingFlat || '',
        amount: parseFloat(body.amount) || 0,
        paymentMode: body.paymentMode || 'CASH',
        isInKind: Boolean(body.isInKind),
        inKindDetails: body.inKindDetails || null,
        receiptNo,
        collectorName: body.collectorName || 'स्वयंसेवक',
        year: body.year ? parseInt(body.year) : 2026,
        status: body.status || 'PAID',
        pledgeDate: body.pledgeDate ? new Date(body.pledgeDate) : null,
        notes: body.notes || null,
      },
    });

    // Update cash or bank in Mandal if paid
    if (newDonation.status === 'PAID') {
      if (newDonation.paymentMode === 'CASH') {
        await db.mandal.update({
          where: { id: mandal.id },
          data: { cashInHand: { increment: newDonation.amount } },
        });
      } else {
        await db.mandal.update({
          where: { id: mandal.id },
          data: { bankBalance: { increment: newDonation.amount } },
        });
      }
    }

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }
}
