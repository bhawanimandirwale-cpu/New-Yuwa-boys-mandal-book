import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpToken from '@/models/OtpToken';
import { sendOtpDevSms } from '@/lib/otpdev';
import { isPhoneAvailable } from '@/lib/userResolver';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  try {
    const { phone, checkAvailable } = await req.json();
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return NextResponse.json(
        { error: 'कृपया योग्य १० अंकी मोबाईल नंबर टाका' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    // If checkAvailable is requested, ensure phone is not already owned by another account
    if (checkAvailable) {
      const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
      const token = await getToken({ req: req as any, secret });
      const avail = await isPhoneAvailable(cleanPhone, token?.id as string);
      if (!avail.available) {
        return NextResponse.json(
          { error: `हा मोबाईल नंबर (+91 ${cleanPhone}) आधीच दुसऱ्या खात्याशी जोडलेला आहे. कृपया आपला नवीन नंबर वापरा.` },
          { status: 409 }
        );
      }
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save in MongoDB with 5-minute expiry
    await connectToDatabase();
    await OtpToken.deleteMany({ phone: cleanPhone });
    await OtpToken.create({
      phone: cleanPhone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 3. Dispatch SMS via OTP.dev
    await sendOtpDevSms(cleanPhone, otp);

    return NextResponse.json({
      success: true,
      message: 'मोबाईलवर SMS OTP यशस्वीरित्या पाठवला गेला!',
    });
  } catch (error: any) {
    console.error('OTP.dev Send Error:', error);
    return NextResponse.json(
      { error: error.message || 'SMS पाठवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' },
      { status: 500 }
    );
  }
}
