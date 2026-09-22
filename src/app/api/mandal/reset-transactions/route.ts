import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { Donation } from '@/models/Donation';
import { Expense } from '@/models/Expense';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json(
        { error: 'अनधिकृत प्रवेश. कृपया आधी लॉगिन करा.' },
        { status: 401 }
      );
    }

    const normalizedEmail = token?.email ? (token.email as string).toLowerCase().trim() : '';
    const rawPhone = token?.phone ? (token.phone as string).replace(/\D/g, '').slice(-10) : '';
    const isAdmin =
      normalizedEmail === 'bhawanimandirwale@gmail.com' ||
      rawPhone === '7499085045' ||
      rawPhone === '9923092340' ||
      token?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'प्रवेश नाकारला: फक्त मंडळाच्या अध्यक्षांनाच (Adhyaksh) सर्व व्यवहार व हिशोब शून्यापासून सुरू करण्याचा अधिकार आहे.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { confirmWord } = body;

    if (confirmWord !== 'RESET' && confirmWord !== 'हिशोब रिसेट') {
      return NextResponse.json(
        { error: 'पुष्टीकरण शब्द चुकीचा आहे. कृपया "RESET" असा अचूक शब्द टाईप करा.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const mandal = await Mandal.findOne();
    if (!mandal) {
      return NextResponse.json({ error: 'मंडळाची माहिती डेटाबेसमध्ये आढळली नाही.' }, { status: 404 });
    }

    // 1. Delete all donation records for this mandal
    const donationsResult = await Donation.deleteMany({ mandalId: mandal._id });

    // 2. Delete all expense records for this mandal
    const expensesResult = await Expense.deleteMany({ mandalId: mandal._id });

    // 3. Reset cash and bank balances to zero for fresh financial year ledger
    mandal.cashInHand = 0;
    mandal.bankBalance = 0;
    await mandal.save();

    return NextResponse.json({
      success: true,
      message: 'सर्व जमा-खर्च व्यवहार, पावत्या व व्हाऊचर्स यशस्वीरित्या हटवून हिशोब शून्यापासून (नवीन) सुरू करण्यात आला आहे.',
      deletedDonations: donationsResult.deletedCount,
      deletedExpenses: expensesResult.deletedCount,
    });
  } catch (error: any) {
    console.error('Error resetting transactions:', error);
    return NextResponse.json(
      { error: error?.message || 'हिशोब रिसेट करताना सर्व्हर त्रुटी आली.' },
      { status: 500 }
    );
  }
}
