import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OtpToken } from '@/models/OtpToken';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'कृपया वैध ईमेल आयडी प्रविष्ट करा.' }, { status: 400 });
    }

    await connectToDatabase();

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP record for this email
    await OtpToken.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send email via Gmail Nodemailer
    const emailSent = await sendOtpEmail(email.toLowerCase().trim(), otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'ईमेल पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'आपल्या ईमेलवर ६-अंकी OTP पाठवण्यात आला आहे.',
    });
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
