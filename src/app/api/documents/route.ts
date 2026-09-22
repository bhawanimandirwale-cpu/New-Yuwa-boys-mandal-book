import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const category = searchParams.get('category');

    const whereClause: any = { year };
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    const documents = await db.permitDocument.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mandal = await db.mandal.findFirst();

    if (!mandal) {
      return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
    }

    const newDoc = await db.permitDocument.create({
      data: {
        mandalId: mandal.id,
        title: body.title,
        category: body.category || 'OTHER',
        fileUrl: body.fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        year: body.year ? parseInt(body.year) : 2026,
        status: body.status || 'APPROVED',
        officerNotes: body.officerNotes || null,
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
