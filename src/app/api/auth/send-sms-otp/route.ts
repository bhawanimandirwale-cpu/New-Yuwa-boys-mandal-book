import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpToken from '@/models/OtpToken';
import { sendOtpDevSms } from '@/lib/otpdev';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return NextResponse.json(
        { error: 'कृपया योग्य १० अंकी मोबाईल नंबर टाका' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

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
