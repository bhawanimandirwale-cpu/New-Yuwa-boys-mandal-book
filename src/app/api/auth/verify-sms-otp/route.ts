import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpToken from '@/models/OtpToken';
import User from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';

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

    // 2. Identify if Adhyaksh (Parth Patil: 7499085045 / 9923092340)
    const isAdhyaksh = cleanPhone === '7499085045' || cleanPhone === '9923092340';

    // 3. Upsert User in MongoDB
    let user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` },
        { phone: `91${cleanPhone}` },
      ],
    });

    const mandal = await Mandal.findOne();

    if (!user) {
      user = await User.create({
        phone: `+91${cleanPhone}`,
        name: isAdhyaksh ? 'पार्थ पाटील (अध्यक्ष)' : 'मंडळ कार्यकर्ता',
        role: isAdhyaksh ? 'SUPER_ADMIN' : 'USER',
        activeMandalId: mandal?._id,
      });
    } else if (isAdhyaksh) {
      let updated = false;
      if (user.role !== 'SUPER_ADMIN') {
        user.role = 'SUPER_ADMIN';
        updated = true;
      }
      if (user.name !== 'पार्थ पाटील (अध्यक्ष)') {
        user.name = 'पार्थ पाटील (अध्यक्ष)';
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    if (mandal) {
      let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
      if (!member) {
        member = await MandalMember.create({
          mandalId: mandal._id,
          userId: user._id,
          role: isAdhyaksh ? 'ADMIN' : 'VOLUNTEER',
          status: 'ACTIVE',
        });
      }
    }

    // 4. Clean up OTP record
    await OtpToken.deleteOne({ _id: record._id });

    return NextResponse.json({
      success: true,
      message: 'लॉगिन यशस्वी!',
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        role: isAdhyaksh ? 'ADMIN' : 'VOLUNTEER',
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
