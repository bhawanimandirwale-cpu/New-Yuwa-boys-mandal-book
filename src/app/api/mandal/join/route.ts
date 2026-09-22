import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { User } from '@/models/User';
import { MandalMember } from '@/models/MandalMember';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { inviteCode, name, phone, userEmail } = body;

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: 'मंडळ आमंत्रण कोड आवश्यक आहे.' }, { status: 400 });
    }

    await connectToDatabase();

    const mandal = await Mandal.findOne();
    if (!mandal) {
      return NextResponse.json({ error: 'मंडळ आढळले नाही.' }, { status: 404 });
    }

    const officialCode = (mandal.inviteCode || 'NYB026').trim().toUpperCase();
    const inputCode = inviteCode.trim().toUpperCase();

    if (inputCode !== officialCode) {
      return NextResponse.json(
        { error: 'अवैध मंडळ कोड! कृपया योग्य कोड टाका किंवा अध्यक्षांशी संपर्क साधा.' },
        { status: 400 }
      );
    }

    // Get current logged-in user from token if available
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });
    const targetEmail = (userEmail || token?.email || '').toLowerCase().trim();

    let user = null;
    if (targetEmail) {
      user = await User.findOne({ email: targetEmail });
      if (!user) {
        user = await User.create({
          email: targetEmail,
          name: name?.trim() || token?.name || targetEmail.split('@')[0],
          phone: phone?.trim() || '',
          role: 'USER',
        });
      } else {
        if (name?.trim() && !user.name) user.name = name.trim();
        if (phone?.trim() && !user.phone) user.phone = phone.trim();
        await user.save();
      }
    } else if (name?.trim()) {
      const generatedEmail = `${name.trim().toLowerCase().replace(/\s+/g, '.')}-${Date.now()}@mandalbook.local`;
      user = await User.create({
        name: name.trim(),
        email: generatedEmail,
        phone: phone?.trim() || '',
        role: 'USER',
      });
    }

    if (user) {
      await MandalMember.findOneAndUpdate(
        { mandalId: mandal._id, userId: user._id },
        {
          role: 'VOLUNTEER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'अभिनंदन! अधिकृत मंडळ कोड स्वीकारला गेला असून तुम्हाला मंडळात प्रवेश मिळाला आहे.',
      mandal: {
        id: mandal._id.toString(),
        name: mandal.name,
        inviteCode: mandal.inviteCode,
      },
    });
  } catch (error) {
    console.error('Error joining mandal with code:', error);
    return NextResponse.json({ error: 'मंडळात सामील होताना सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
