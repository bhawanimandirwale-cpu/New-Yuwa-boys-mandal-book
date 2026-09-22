import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const donation = await db.varganiDonation.findFirst({
      where: {
        OR: [{ id }, { receiptNo: id }],
      },
      include: {
        mandal: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const existing = await db.varganiDonation.findUnique({
      where: { id },
      include: { mandal: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const updated = await db.varganiDonation.update({
      where: { id },
      data: {
        status: body.status || existing.status,
        paymentMode: body.paymentMode || existing.paymentMode,
      },
    });

    // If converted from PLEDGED to PAID, update mandal cash/bank
    if (existing.status === 'PLEDGED' && updated.status === 'PAID') {
      if (updated.paymentMode === 'CASH') {
        await db.mandal.update({
          where: { id: existing.mandalId },
          data: { cashInHand: { increment: updated.amount } },
        });
      } else {
        await db.mandal.update({
          where: { id: existing.mandalId },
          data: { bankBalance: { increment: updated.amount } },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}
