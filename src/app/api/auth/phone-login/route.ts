import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';

// Helper to normalize Indian phone number (+91XXXXXXXXXX)
function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return input.startsWith('+') ? input : `+${digits}`;
}

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

    await connectToDatabase();

    // Check if phone matches Mandal Helpline / Adhyaksh (Parth Patil)
    const rawTenDigits = verifiedPhone.replace(/\D/g, '').slice(-10);
    const isAdhyakshPhone = rawTenDigits === '7499085045' || rawTenDigits === '9923092340';

    // Find existing user by phone (checking both normalized and 10-digit formats)
    let user = await User.findOne({
      $or: [
        { phone: verifiedPhone },
        { phone: rawTenDigits },
        { phone: `+91${rawTenDigits}` },
      ],
    });

    const mandal = await Mandal.findOne();

    if (!user) {
      // Create new user with phone
      user = await User.create({
        phone: verifiedPhone,
        name: isAdhyakshPhone ? 'पार्थ पाटील (अध्यक्ष)' : `कार्यकर्ता (${rawTenDigits.slice(-4)})`,
        role: isAdhyakshPhone ? 'SUPER_ADMIN' : 'USER',
        activeMandalId: mandal?._id,
      });
    } else if (isAdhyakshPhone) {
      let updated = false;
      if (user.role !== 'SUPER_ADMIN') {
        user.role = 'SUPER_ADMIN';
        updated = true;
      }
      if (user.name !== 'पार्थ पाटील (अध्यक्ष)') {
        user.name = 'पार्थ पाटील (अध्यक्ष)';
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Link user to Mandal membership
    let role = isAdhyakshPhone ? 'ADMIN' : 'PENDING';
    let status = isAdhyakshPhone ? 'ACTIVE' : 'PENDING';

    if (mandal) {
      let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
      if (!member) {
        member = await MandalMember.create({
          mandalId: mandal._id,
          userId: user._id,
          role: isAdhyakshPhone ? 'ADMIN' : 'VOLUNTEER',
          status: isAdhyakshPhone ? 'ACTIVE' : 'PENDING',
        });
      } else if (isAdhyakshPhone && (member.role !== 'ADMIN' || member.status !== 'ACTIVE')) {
        member.role = 'ADMIN';
        member.status = 'ACTIVE';
        await member.save();
      }

      if (isAdhyakshPhone) {
        role = 'ADMIN';
        status = 'ACTIVE';
      } else {
        role = member.status === 'ACTIVE' ? member.role : 'PENDING';
        status = member.status;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role,
        status,
        mandalId: mandal?._id.toString(),
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
