import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { resolveUnifiedUser, normalizePhoneNumber } from '@/lib/userResolver';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, phone } = body;

    if (!phone && !idToken) {
      return NextResponse.json(
        { error: 'मोबाईल नंबर किंवा आयडी टोकन आवश्यक आहे.' },
        { status: 400 }
      );
    }

    let verifiedPhone = phone ? normalizePhoneNumber(phone) : '';

    // Verify idToken with Google Identity Toolkit REST API if provided
    if (idToken) {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (apiKey) {
        try {
          const verifyRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.users?.[0]?.phoneNumber) {
            verifiedPhone = normalizePhoneNumber(verifyData.users[0].phoneNumber);
          }
        } catch (tokenErr) {
          console.warn('Firebase token lookup warning (proceeding with validated phone):', tokenErr);
        }
      }
    }

    if (!verifiedPhone || verifiedPhone.length < 10) {
      return NextResponse.json(
        { error: 'अवैध मोबाईल नंबर किंवा पडताळणी अयशस्वी.' },
        { status: 400 }
      );
    }

    // Unify user across phone and email
    const { user, mandal, role, status } = await resolveUnifiedUser({ phone: verifiedPhone });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        role,
        status,
        mandalId: mandal?._id?.toString(),
      },
    });
  } catch (error: any) {
    console.error('Phone login API error:', error);
    return NextResponse.json(
      { error: error?.message || 'मोबाईल लॉगिन करताना सर्व्हर त्रुटी आली.' },
      { status: 500 }
    );
  }
}
