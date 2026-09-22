import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { User } from '@/models/User';
import { MandalMember } from '@/models/MandalMember';

export async function POST(req: NextRequest) {
  try {
    const { inviteCode, userEmail } = await req.json();

    if (!inviteCode) {
      return NextResponse.json({ error: 'आमंत्रण कोड आवश्यक आहे.' }, { status: 400 });
    }

    await connectToDatabase();

    const mandal = await Mandal.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!mandal) {
      return NextResponse.json({ error: 'अवैध आमंत्रण कोड. कृपया योग्य कोड टाका.' }, { status: 404 });
    }

    if (userEmail) {
      const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (user) {
        await MandalMember.findOneAndUpdate(
          { mandalId: mandal._id, userId: user._id },
          { role: 'VOLUNTEER', status: 'ACTIVE' },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ success: true, mandal });
  } catch (error) {
    console.error('Error joining mandal:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
