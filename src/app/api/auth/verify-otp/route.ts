import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OtpToken } from '@/models/OtpToken';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';

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

    // Find or create user
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const defaultName = normalizedEmail.split('@')[0];
      user = await User.create({
        email: normalizedEmail,
        name: defaultName,
        role: 'USER',
      });
    }

    const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com';

    // Check Mandal membership
    const primaryMandal = await Mandal.findOne();
    let member = null;
    if (primaryMandal) {
      member = await MandalMember.findOne({ mandalId: primaryMandal._id, userId: user._id });
      if (!member) {
        member = await MandalMember.create({
          mandalId: primaryMandal._id,
          userId: user._id,
          role: isAdmin ? 'ADMIN' : 'MEMBER',
          status: isAdmin ? 'ACTIVE' : 'PENDING',
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: member ? member.role : 'MEMBER',
      },
    });
  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
