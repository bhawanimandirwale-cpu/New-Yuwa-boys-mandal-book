import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let mandal = await db.mandal.findFirst({
      include: {
        _count: {
          select: {
            donations: true,
            expenses: true,
            documents: true,
            users: true,
          },
        },
      },
    });

    if (!mandal) {
      return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
    }

    // Compute live financial totals
    const donationsAgg = await db.varganiDonation.aggregate({
      where: { mandalId: mandal.id, status: 'PAID' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const pledgedAgg = await db.varganiDonation.aggregate({
      where: { mandalId: mandal.id, status: 'PLEDGED' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const expensesAgg = await db.expense.aggregate({
      where: { mandalId: mandal.id, status: 'APPROVED' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalCollected = donationsAgg._sum.amount || 0;
    const totalPledged = pledgedAgg._sum.amount || 0;
    const totalExpenses = expensesAgg._sum.amount || 0;
    const netBalance = totalCollected - totalExpenses;

    return NextResponse.json({
      mandal,
      stats: {
        totalCollected,
        totalPledged,
        totalExpenses,
        netBalance,
        cashInHand: mandal.cashInHand,
        bankBalance: mandal.bankBalance,
        donationCount: donationsAgg._count.id,
        pledgedCount: pledgedAgg._count.id,
        expenseCount: expensesAgg._count.id,
      },
    });
  } catch (error) {
    console.error('Error fetching mandal data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
