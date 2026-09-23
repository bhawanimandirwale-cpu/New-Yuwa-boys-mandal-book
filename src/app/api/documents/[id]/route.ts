import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PermitDocument } from '@/models/Document';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const doc = await PermitDocument.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'कागदपत्र सापडले नाही.' }, { status: 404 });
    }

    const obj: any = doc.toObject();
    obj.id = doc._id.toString();

    return NextResponse.json(obj);
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    return NextResponse.json({ error: 'कागदपत्र माहिती मिळवताना अडचण आली.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'अनधिकृत प्रवेश. कृपया लॉगिन करा.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    await connectToDatabase();

    const existing = await PermitDocument.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'कागदपत्र सापडले नाही.' }, { status: 404 });
    }

    if (body.title !== undefined) existing.title = body.title.trim();
    if (body.category !== undefined) existing.category = body.category;
    if (body.fileUrl !== undefined) existing.fileUrl = body.fileUrl.trim();
    if (body.officerNotes !== undefined) existing.officerNotes = body.officerNotes.trim();
    if (body.status !== undefined) existing.status = body.status;
    if (body.year !== undefined) existing.year = parseInt(body.year);

    await existing.save();

    const obj: any = existing.toObject();
    obj.id = existing._id.toString();

    return NextResponse.json(obj);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'कागदपत्र अद्ययावत करताना अडचण आली.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'अनधिकृत प्रवेश. कृपया लॉगिन करा.' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const existing = await PermitDocument.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'कागदपत्र आधीच हटवले गेले आहे किंवा अस्तित्वात नाही.' }, { status: 404 });
    }

    await PermitDocument.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'कागदपत्र यशस्वीरीत्या हटवले गेले आहे.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'कागदपत्र हटवताना अडचण आली.' }, { status: 500 });
  }
}
