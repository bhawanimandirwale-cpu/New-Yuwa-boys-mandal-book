import { NextRequest, NextResponse } from 'next/server';
import { isPhoneAvailable, isEmailAvailable, getClean10Digits } from '@/lib/userResolver';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();

    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });
    const currentUserId = (token as any)?.id;

    if (phone) {
      const clean10 = getClean10Digits(phone);
      if (clean10.length !== 10) {
        return NextResponse.json(
          { available: false, error: 'कृपया योग्य १०-अंकी मोबाईल नंबर प्रविष्ट करा.' },
          { status: 400 }
        );
      }

      const res = await isPhoneAvailable(clean10, currentUserId);
      if (!res.available) {
        return NextResponse.json({
          available: false,
          error: `हा मोबाईल नंबर (+91 ${clean10}) आधीच दुसऱ्या खात्याशी जोडलेला आहे. कृपया नवीन किंवा स्वतःचा नंबर वापरा.`,
          ownerEmail: res.ownerEmail,
        });
      }

      return NextResponse.json({ available: true, message: 'मोबाईल नंबर उपलब्ध आहे.' });
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail.includes('@')) {
        return NextResponse.json(
          { available: false, error: 'कृपया योग्य ईमेल आयडी प्रविष्ट करा.' },
          { status: 400 }
        );
      }

      const res = await isEmailAvailable(normalizedEmail, currentUserId);
      if (!res.available) {
        return NextResponse.json({
          available: false,
          error: `हा ईमेल (${normalizedEmail}) आधीच दुसऱ्या मोबाईल नंबरशी जोडलेला आहे.`,
          ownerPhone: res.ownerPhone,
        });
      }

      return NextResponse.json({ available: true, message: 'ईमेल उपलब्ध आहे.' });
    }

    return NextResponse.json({ error: 'तपासण्यासाठी फोन किंवा ईमेल द्या.' }, { status: 400 });
  } catch (error: any) {
    console.error('Check availability error:', error);
    return NextResponse.json({ error: 'उपलब्धता तपासताना सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
