import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Mandal } from '@/models/Mandal';
import { User } from '@/models/User';
import { MandalMember } from '@/models/MandalMember';
import { Donation } from '@/models/Donation';
import { resolveUnifiedUser } from '@/lib/userResolver';

export async function GET() {
  try {
    await connectToDatabase();

    const mandal = await Mandal.findOne();
    if (!mandal) {
      return NextResponse.json({ members: [], inviteCode: 'NYB026' });
    }

    // Fetch members of this mandal
    const members = await MandalMember.find({ mandalId: mandal._id })
      .populate('userId')
      .sort({ joinedAt: 1 });

    // Calculate collection stats per volunteer from donations
    const donationStats = await Donation.aggregate([
      { $match: { mandalId: mandal._id, status: 'PAID' } },
      {
        $group: {
          _id: '$collectorName',
          totalAmount: { $sum: '$amount' },
          receiptCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap: Record<string, { total: number; count: number }> = {};
    donationStats.forEach((s) => {
      if (s._id) {
        statsMap[s._id] = { total: s.totalAmount, count: s.receiptCount };
      }
    });

    const formatted = members.map((m: any) => {
      const user = m.userId || {};
      const userName = user.name || 'अज्ञात कार्यकर्ता';
      const stats = statsMap[userName] || { total: 0, count: 0 };

      return {
        id: m._id.toString(),
        userId: user._id ? user._id.toString() : null,
        name: userName,
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        role: m.role || 'VOLUNTEER',
        status: m.status || 'ACTIVE',
        joinedAt: m.joinedAt,
        totalCollected: stats.total,
        receiptCount: stats.count,
      };
    });

    return NextResponse.json({
      members: formatted,
      inviteCode: mandal.inviteCode || 'NYB026',
      mandalName: mandal.name,
    });
  } catch (error) {
    console.error('Error fetching members from MongoDB Atlas:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const mandal = await Mandal.findOne();
    if (!mandal) {
      return NextResponse.json({ error: 'मंडळ आढळले नाही.' }, { status: 404 });
    }

    const { name, phone, email, role } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'नाव आवश्यक आहे.' }, { status: 400 });
    }

    const normalizedEmail = email?.trim() ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone?.trim() || undefined;

    const { user } = await resolveUnifiedUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
    });

    // Upsert membership
    const member = await MandalMember.findOneAndUpdate(
      { mandalId: mandal._id, userId: user._id },
      {
        role: role || 'VOLUNTEER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        id: member._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
        totalCollected: 0,
        receiptCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding member to MongoDB Atlas:', error);
    return NextResponse.json({ error: 'कार्यकर्ता जोडताना त्रुटी आली.' }, { status: 500 });
  }
}
