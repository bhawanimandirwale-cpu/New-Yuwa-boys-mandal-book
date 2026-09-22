import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MandalMember } from '@/models/MandalMember';
import { getToken } from 'next-auth/jwt';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });
    const isAdmin = token?.email?.toLowerCase().trim() === 'bhawanimandirwale@gmail.com' || token?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'फक्त अध्यक्षांना (Adhyaksh) सदस्यांची भूमिका किंवा स्थिती बदलण्याचा अधिकार आहे.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    await connectToDatabase();

    const updateData: any = {};
    if (body.role) updateData.role = body.role;
    if (body.status) updateData.status = body.status;

    const updated = await MandalMember.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'सदस्य सापडला नाही.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });
    const isAdmin = token?.email?.toLowerCase().trim() === 'bhawanimandirwale@gmail.com' || token?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'फक्त अध्यक्षांना (Adhyaksh) सदस्य हटवण्याचा अधिकार आहे.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    await connectToDatabase();

    const deleted = await MandalMember.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'सदस्य सापडला नाही.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'कार्यकर्ता यशस्वीरित्या हटवला गेला.' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'सर्व्हर त्रुटी आली.' }, { status: 500 });
  }
}
