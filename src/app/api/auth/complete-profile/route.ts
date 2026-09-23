import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';
import { OtpToken } from '@/models/OtpToken';
import { isPhoneAvailable, isEmailAvailable, getClean10Digits } from '@/lib/userResolver';

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

    const body = await req.json();
    const { phone, smsOtp, email, emailOtp, name, inviteCode } = body;

    await connectToDatabase();

    // 1. Locate current user
    let user = null;
    if (token.id) {
      user = await User.findById(token.id);
    }
    if (!user && token.email) {
      user = await User.findOne({ email: token.email.toLowerCase().trim() });
    }
    if (!user && (token as any).phone) {
      const clean = getClean10Digits((token as any).phone);
      user = await User.findOne({
        $or: [{ phone: clean }, { phone: `+91${clean}` }, { phone: `91${clean}` }],
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'वापरकर्ता प्रोफाइल सापडले नाही.' }, { status: 404 });
    }

    const isAdhyaksh =
      user.email === 'bhawanimandirwale@gmail.com' ||
      user.role === 'SUPER_ADMIN';

    // 2. Verify and Bind Mobile Phone
    if (phone) {
      const cleanPhone = getClean10Digits(phone);
      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          { error: 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर टाका.' },
          { status: 400 }
        );
      }

      // Check uniqueness: Is this phone number already claimed by another user?
      if (!isAdhyaksh) {
        const phoneCheck = await isPhoneAvailable(cleanPhone, user._id);
        if (!phoneCheck.available) {
          return NextResponse.json(
            {
              error: `हा मोबाईल नंबर (+91 ${cleanPhone}) आधीच दुसऱ्या खात्याशी जोडलेला आहे. कृपया आपला नवीन नंबर वापरा.`,
            },
            { status: 409 }
          );
        }
      }

      // If phone is being changed or added, require SMS OTP verification
      if (!user.phone || getClean10Digits(user.phone) !== cleanPhone) {
        if (!smsOtp) {
          return NextResponse.json(
            { error: 'मोबाईल पडताळणीसाठी SMS OTP आवश्यक आहे.' },
            { status: 400 }
          );
        }

        const otpRecord = await OtpToken.findOne({
          phone: cleanPhone,
          otp: String(smsOtp).trim(),
        });

        if (!otpRecord || new Date() > otpRecord.expiresAt) {
          return NextResponse.json(
            { error: 'अवैध किंवा कालबाह्य झालेला SMS OTP! कृपया पुन्हा नवीन OTP मागवा.' },
            { status: 400 }
          );
        }

        // Clean up verified OTP
        await OtpToken.deleteOne({ _id: otpRecord._id });
        user.phone = `+91${cleanPhone}`;
      }
    }

    // 3. Verify and Bind Email
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail.includes('@')) {
        return NextResponse.json(
          { error: 'कृपया वैध Gmail ईमेल आयडी प्रविष्ट करा.' },
          { status: 400 }
        );
      }

      // Check uniqueness: Is this email already claimed by another user?
      if (!isAdhyaksh) {
        const emailCheck = await isEmailAvailable(normalizedEmail, user._id);
        if (!emailCheck.available) {
          return NextResponse.json(
            {
              error: `हा ईमेल (${normalizedEmail}) आधीच दुसऱ्या मोबाईल नंबरशी जोडलेला आहे. कृपया स्वतःचा ईमेल वापरा.`,
            },
            { status: 409 }
          );
        }
      }

      // If email is being changed or added, require Email OTP verification
      if (!user.email || user.email.toLowerCase().trim() !== normalizedEmail) {
        if (!emailOtp) {
          return NextResponse.json(
            { error: 'ईमेल पडताळणीसाठी ईमेलवर आलेला ६-अंकी OTP आवश्यक आहे.' },
            { status: 400 }
          );
        }

        const otpRecord = await OtpToken.findOne({
          email: normalizedEmail,
          otp: String(emailOtp).trim(),
        });

        if (!otpRecord || new Date() > otpRecord.expiresAt) {
          return NextResponse.json(
            { error: 'अवैध किंवा कालबाह्य झालेला ईमेल OTP! कृपया पुन्हा नवीन OTP मागवा.' },
            { status: 400 }
          );
        }

        // Clean up verified OTP
        await OtpToken.deleteOne({ _id: otpRecord._id });
        user.email = normalizedEmail;
      }
    }

    // 4. Update Name if provided
    if (name?.trim()) {
      user.name = name.trim();
    }

    await user.save();

    // 5. Check Mandal Membership & Invite Code
    const mandal = await Mandal.findOne();
    let memberStatus: 'ACTIVE' | 'PENDING' = isAdhyaksh ? 'ACTIVE' : 'PENDING';
    const memberRole: 'ADMIN' | 'VOLUNTEER' = isAdhyaksh ? 'ADMIN' : 'VOLUNTEER';

    if (mandal) {
      const officialCode = (mandal.inviteCode || 'NYB026').trim().toUpperCase();
      const inputCode = (inviteCode || '').trim().toUpperCase();

      if (inputCode === officialCode || isAdhyaksh) {
        memberStatus = 'ACTIVE';
      }

      let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
      if (!member) {
        member = await MandalMember.create({
          mandalId: mandal._id,
          userId: user._id,
          role: memberRole,
          status: memberStatus,
          joinedAt: new Date(),
        });
      } else if (memberStatus === 'ACTIVE' && member.status !== 'ACTIVE') {
        member.status = 'ACTIVE';
        await member.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'प्रोफाईल व संपर्क तपशील यशस्वीरित्या पूर्ण व सत्यापित झाले!',
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        role: user.role,
        status: memberStatus,
      },
    });
  } catch (error: any) {
    console.error('Error in complete-profile API:', error);
    return NextResponse.json(
      { error: error?.message || 'प्रोफाईल पूर्ण करताना त्रुटी आली.' },
      { status: 500 }
    );
  }
}
