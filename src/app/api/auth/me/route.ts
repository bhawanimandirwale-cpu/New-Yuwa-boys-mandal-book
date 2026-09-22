import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { resolveUnifiedUser } from '@/lib/userResolver';
import { Mandal } from '@/models/Mandal';

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token';
    const token = await getToken({ req, secret });

    await connectToDatabase();

    const mandal = await Mandal.findOne();

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        mandal: mandal
          ? {
              name: mandal.name,
              city: mandal.city,
              inviteCode: mandal.inviteCode || 'NYB026',
              presidentName: mandal.presidentName || 'पार्थ पाटील',
            }
          : null,
      });
    }

    const { user, role, status } = await resolveUnifiedUser({
      id: token.id as string,
      email: token.email,
      phone: (token as any).phone,
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: role || user.role,
        status,
        avatarUrl: user.avatarUrl || '',
      },
      mandal: mandal
        ? {
            id: mandal._id.toString(),
            name: mandal.name,
            city: mandal.city,
            inviteCode: mandal.inviteCode || 'NYB026',
            presidentName: mandal.presidentName || 'पार्थ पाटील',
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'खाते तपशील मिळवताना अडचण आली.' }, { status: 500 });
  }
}
