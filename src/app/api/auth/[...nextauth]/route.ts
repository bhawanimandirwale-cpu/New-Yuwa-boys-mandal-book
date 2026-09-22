import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';
import { OtpToken } from '@/models/OtpToken';

function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return input.startsWith('+') ? input : `+${digits}`;
}

const handler = NextAuth({
  providers: [
    // 1. Google OAuth 2.0 Provider (1-Click)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // 2. Mobile Phone SMS OTP Provider (OTP.dev Server-Side SMS)
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone SMS OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'SMS OTP Code', type: 'text' },
        idToken: { label: 'Firebase ID Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;

        await connectToDatabase();
        let verifiedPhone = normalizePhoneNumber(credentials.phone);
        const rawTenDigits = verifiedPhone.replace(/\D/g, '').slice(-10);

        // Verify OTP.dev 6-digit OTP from MongoDB if provided
        if (credentials.otp) {
          const otpRecord = await OtpToken.findOne({
            phone: rawTenDigits,
            otp: String(credentials.otp).trim(),
          });
          if (!otpRecord || new Date() > otpRecord.expiresAt) {
            return null; // Invalid or expired OTP
          }
          await OtpToken.deleteOne({ _id: otpRecord._id });
        } else if (credentials.idToken && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          try {
            const verifyRes = await fetch(
              `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: credentials.idToken }),
              }
            );
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.users?.[0]?.phoneNumber) {
              verifiedPhone = normalizePhoneNumber(verifyData.users[0].phoneNumber);
            }
          } catch (err) {
            console.warn('Firebase token lookup warning in authorize:', err);
          }
        }

        const isAdhyaksh = rawTenDigits === '7499085045' || rawTenDigits === '9923092340';

        let user = await User.findOne({
          $or: [
            { phone: verifiedPhone },
            { phone: rawTenDigits },
            { phone: `+91${rawTenDigits}` },
          ],
        });

        const mandal = await Mandal.findOne();

        if (!user) {
          user = await User.create({
            phone: verifiedPhone,
            name: isAdhyaksh ? 'पार्थ पाटील (अध्यक्ष)' : `कार्यकर्ता (${rawTenDigits.slice(-4)})`,
            role: isAdhyaksh ? 'SUPER_ADMIN' : 'USER',
            activeMandalId: mandal?._id,
          });
        } else if (isAdhyaksh) {
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

        let role = isAdhyaksh ? 'ADMIN' : 'PENDING';
        let status = isAdhyaksh ? 'ACTIVE' : 'PENDING';

        if (mandal) {
          let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
          if (!member) {
            member = await MandalMember.create({
              mandalId: mandal._id,
              userId: user._id,
              role: isAdhyaksh ? 'ADMIN' : 'VOLUNTEER',
              status: isAdhyaksh ? 'ACTIVE' : 'PENDING',
            });
          } else if (isAdhyaksh && (member.role !== 'ADMIN' || member.status !== 'ACTIVE')) {
            member.role = 'ADMIN';
            member.status = 'ACTIVE';
            await member.save();
          }

          if (isAdhyaksh) {
            role = 'ADMIN';
            status = 'ACTIVE';
          } else {
            role = member.status === 'ACTIVE' ? member.role : 'PENDING';
            status = member.status;
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          role,
          status,
          mandalId: mandal?._id.toString(),
        } as any;
      },
    }),

    // 3. Gmail Email OTP Provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Gmail OTP',
      credentials: {
        email: { label: 'Email', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await connectToDatabase();
        const normalizedEmail = credentials.email.toLowerCase().trim();
        const otp = credentials.otp?.trim();

        // Verify token in OtpToken collection
        if (otp) {
          const { OtpToken } = await import('@/models/OtpToken');
          const tokenRecord = await OtpToken.findOne({ email: normalizedEmail, otp });
          if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
            return null;
          }
          await OtpToken.deleteOne({ _id: tokenRecord._id });
        }

        const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com';

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            email: normalizedEmail,
            name: isAdmin ? 'पार्थ पाटील (अध्यक्ष)' : normalizedEmail.split('@')[0],
            role: isAdmin ? 'SUPER_ADMIN' : 'USER',
          });
        } else if (isAdmin) {
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

        const mandal = await Mandal.findOne();
        let role = isAdmin ? 'ADMIN' : 'PENDING';
        let status = isAdmin ? 'ACTIVE' : 'PENDING';

        if (mandal) {
          let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
          if (!member) {
            member = await MandalMember.create({
              mandalId: mandal._id,
              userId: user._id,
              role: isAdmin ? 'ADMIN' : 'MEMBER',
              status: isAdmin ? 'ACTIVE' : 'PENDING',
            });
          } else if (isAdmin && (member.role !== 'ADMIN' || member.status !== 'ACTIVE')) {
            member.role = 'ADMIN';
            member.status = 'ACTIVE';
            await member.save();
          }

          if (isAdmin) {
            role = 'ADMIN';
            status = 'ACTIVE';
          } else {
            role = member.status === 'ACTIVE' ? member.role : 'PENDING';
            status = member.status;
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          role,
          status,
          mandalId: mandal?._id.toString(),
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await connectToDatabase();
        const normalizedEmail = user.email.toLowerCase().trim();
        const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com';

        let dbUser = await User.findOne({ email: normalizedEmail });
        if (!dbUser) {
          dbUser = await User.create({
            email: normalizedEmail,
            name: isAdmin ? 'पार्थ पाटील (अध्यक्ष)' : (user.name || normalizedEmail.split('@')[0]),
            avatarUrl: user.image || '',
            role: isAdmin ? 'SUPER_ADMIN' : 'USER',
          });
        } else if (isAdmin) {
          let updated = false;
          if (dbUser.role !== 'SUPER_ADMIN') {
            dbUser.role = 'SUPER_ADMIN';
            updated = true;
          }
          if (dbUser.name !== 'पार्थ पाटील (अध्यक्ष)') {
            dbUser.name = 'पार्थ पाटील (अध्यक्ष)';
            updated = true;
          }
          if (updated) {
            await dbUser.save();
          }
        }

        const mandal = await Mandal.findOne();
        if (mandal) {
          const member = await MandalMember.findOne({ mandalId: mandal._id, userId: dbUser._id });
          if (!member) {
            await MandalMember.create({
              mandalId: mandal._id,
              userId: dbUser._id,
              role: isAdmin ? 'ADMIN' : 'MEMBER',
              status: isAdmin ? 'ACTIVE' : 'PENDING',
            });
          } else if (isAdmin && (member.role !== 'ADMIN' || member.status !== 'ACTIVE')) {
            member.role = 'ADMIN';
            member.status = 'ACTIVE';
            await member.save();
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'PENDING';
        token.status = (user as any).status || 'PENDING';
        token.phone = (user as any).phone || '';
        token.mandalId = (user as any).mandalId;
      }

      await connectToDatabase();
      const normalizedEmail = token.email ? token.email.toLowerCase().trim() : '';
      const rawPhone = token.phone ? (token.phone as string).replace(/\D/g, '').slice(-10) : '';

      const isAdmin =
        normalizedEmail === 'bhawanimandirwale@gmail.com' ||
        rawPhone === '7499085045' ||
        rawPhone === '9923092340';

      let dbUser = null;
      if (token.id) {
        dbUser = await User.findById(token.id);
      }
      if (!dbUser && normalizedEmail) {
        dbUser = await User.findOne({ email: normalizedEmail });
      }
      if (!dbUser && rawPhone) {
        dbUser = await User.findOne({
          $or: [{ phone: rawPhone }, { phone: `+91${rawPhone}` }],
        });
      }

      if (dbUser) {
        token.id = dbUser._id.toString();
        if (dbUser.phone) token.phone = dbUser.phone;
        if (dbUser.email) token.email = dbUser.email;

        const mandal = await Mandal.findOne();
        if (mandal) {
          token.mandalId = mandal._id.toString();
          const member = await MandalMember.findOne({ mandalId: mandal._id, userId: dbUser._id });

          if (isAdmin) {
            token.role = 'ADMIN';
            token.status = 'ACTIVE';
          } else if (member && member.status === 'ACTIVE') {
            token.role = member.role;
            token.status = 'ACTIVE';
          } else {
            token.role = 'PENDING';
            token.status = member?.status || 'PENDING';
          }
        } else {
          token.role = isAdmin ? 'ADMIN' : 'PENDING';
          token.status = isAdmin ? 'ACTIVE' : 'PENDING';
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).phone = token.phone || '';
        (session.user as any).role = token.role || 'PENDING';
        (session.user as any).status = token.status || 'PENDING';
        (session.user as any).mandalId = token.mandalId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token',
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
