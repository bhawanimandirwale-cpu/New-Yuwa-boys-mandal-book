import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpToken from '@/models/OtpToken';
import { resolveUnifiedUser } from '@/lib/userResolver';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'मोबाईल नंबर आणि OTP आवश्यक आहे' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const otpCode = String(otp).trim();

    await connectToDatabase();

    // 1. Check OTP in MongoDB
    const record = await OtpToken.findOne({ phone: cleanPhone, otp: otpCode });
    if (!record || new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'अवैध किंवा कालबाह्य झालेला OTP! कृपया नवीन OTP मागवा.' },
        { status: 400 }
      );
    }

    // 2. Identify and unify user account across phone and email
    const { user, role, status } = await resolveUnifiedUser({ phone: cleanPhone });

    // 3. Clean up OTP record
    await OtpToken.deleteOne({ _id: record._id });

    return NextResponse.json({
      success: true,
      message: 'लॉगिन यशस्वी!',
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        role,
        status,
      },
    });
  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json(
      { error: error.message || 'लॉगिन करताना त्रुटी आली' },
      { status: 500 }
    );
  }
}
