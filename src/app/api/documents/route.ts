import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { PermitDocument } from '@/models/Document';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : 2026;
    const category = searchParams.get('category');

    await connectToDatabase();

    const query: any = { year };
    if (category && category !== 'ALL') {
      query.category = category;
    }

    const docs = await PermitDocument.find(query).sort({ createdAt: -1 });

    const formatted = docs.map((d) => {
      const obj: any = d.toObject();
      obj.id = d._id.toString();
      return obj;
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching documents from MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let mandal = await Mandal.findOne();
    if (!mandal) {
      mandal = await Mandal.create({
        name: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
        activeYear: body.year || 2026,
      });
    }

    const year = body.year ? parseInt(body.year) : mandal.activeYear || 2026;

    const newDoc = await PermitDocument.create({
      mandalId: mandal._id,
      title: body.title,
      category: body.category || 'OTHER',
      fileUrl: body.fileUrl || '',
      year,
      status: body.status || 'APPROVED',
      officerNotes: body.officerNotes || '',
      createdAt: new Date(),
    });

    const obj: any = newDoc.toObject();
    obj.id = newDoc._id.toString();

    return NextResponse.json(obj, { status: 201 });
  } catch (error) {
    console.error('Error creating document in MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}
