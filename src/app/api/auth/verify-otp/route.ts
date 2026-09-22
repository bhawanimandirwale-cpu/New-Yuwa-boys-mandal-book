import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OtpToken } from '@/models/OtpToken';
import { resolveUnifiedUser } from '@/lib/userResolver';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'ईमेल आणि OTP दोन्ही आवश्यक आहेत.' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Verify token
    const tokenRecord = await OtpToken.findOne({ email: normalizedEmail, otp });

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return NextResponse.json(
        { error: 'अवैध किंवा कालबाह्य झालेला OTP. कृपया पुन्हा OTP मागवा.' },
        { status: 400 }
      );
    }

    // Delete used OTP
    await OtpToken.deleteOne({ _id: tokenRecord._id });

    // Unify user across email and phone
    const { user, role, status } = await resolveUnifiedUser({ email: normalizedEmail });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email || '',
        name: user.name,
        phone: user.phone || '',
        role,
        status,
      },
    });
  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
