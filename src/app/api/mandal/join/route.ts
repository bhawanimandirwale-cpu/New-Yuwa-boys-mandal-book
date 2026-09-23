import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';
import { resolveUnifiedUser } from '@/lib/userResolver';

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
    const cleanPhone = phone?.trim() || (token as any)?.phone;

    const { user } = await resolveUnifiedUser({
      id: token?.id as string,
      name: name?.trim() || token?.name,
      email: targetEmail || undefined,
      phone: cleanPhone || undefined,
    });

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
