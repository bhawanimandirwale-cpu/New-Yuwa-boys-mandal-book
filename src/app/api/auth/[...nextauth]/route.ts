import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';
import { OtpToken } from '@/models/OtpToken';

import { resolveUnifiedUser, normalizePhoneNumber } from '@/lib/userResolver';

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
          const otpCode = String(credentials.otp).trim();
          const otpRecord = await OtpToken.findOne({
            $or: [
              { phone: rawTenDigits },
              { phone: `+91${rawTenDigits}` },
              { phone: `91${rawTenDigits}` },
            ],
            otp: otpCode,
          });
          if (!otpRecord) {
            console.warn(`[NextAuth phone-otp] No matching OTP found in MongoDB for phone: ${rawTenDigits}`);
            return null;
          }
          if (new Date() > otpRecord.expiresAt) {
            console.warn(`[NextAuth phone-otp] OTP expired for phone: ${rawTenDigits}`);
            await OtpToken.deleteOne({ _id: otpRecord._id });
            return null;
          }
          // Clean up valid OTP immediately
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

        // Unify user account (links phone & email into a single document)
        const { user, mandal, role, status } = await resolveUnifiedUser({ phone: verifiedPhone });

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone || '',
          email: user.email || '',
          role,
          status,
          mandalId: mandal?._id?.toString(),
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

        // Unify user account (links phone & email into a single document)
        const { user, mandal, role, status } = await resolveUnifiedUser({ email: normalizedEmail });

        return {
          id: user._id.toString(),
          email: user.email || '',
          name: user.name,
          phone: user.phone || '',
          role,
          status,
          mandalId: mandal?._id?.toString(),
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' && user.email) {
          const normalizedEmail = user.email.toLowerCase().trim();
          // Unify user account (links phone & email into a single document)
          const { user: dbUser } = await resolveUnifiedUser({
            email: normalizedEmail,
            name: user.name,
            avatarUrl: user.image,
          });

          // Link Mongo ObjectId to user.id so downstream callbacks receive valid ObjectId
          user.id = dbUser._id.toString();
        }
        return true;
      } catch (error) {
        console.error('Error in NextAuth signIn callback:', error);
        return true; // Still allow signIn so user is not blocked
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role || 'PENDING';
          token.status = (user as any).status || 'PENDING';
          token.phone = (user as any).phone || '';
          token.mandalId = (user as any).mandalId;
        }

        const normalizedEmail = (token.email || user?.email || '').toLowerCase().trim();
        const rawPhone = token.phone ? (token.phone as string).replace(/\D/g, '').slice(-10) : '';

        // Unify & load latest role/status from DB
        const { user: dbUser, mandal, role, status } = await resolveUnifiedUser({
          id: token.id && mongoose.Types.ObjectId.isValid(token.id as string) ? (token.id as string) : undefined,
          email: normalizedEmail,
          phone: rawPhone,
        });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.phone = dbUser.phone || '';
          token.email = dbUser.email || '';
          token.name = dbUser.name;
          token.role = role;
          token.status = status;
          if (mandal) token.mandalId = mandal._id.toString();
        }

        return token;
      } catch (err) {
        console.error('Error in NextAuth jwt callback:', err);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          (session.user as any).id = token.id || token.sub;
          (session.user as any).phone = token.phone || '';
          (session.user as any).role = token.role || 'PENDING';
          (session.user as any).status = token.status || 'PENDING';
          (session.user as any).mandalId = token.mandalId;
        }
        return session;
      } catch (err) {
        console.error('Error in NextAuth session callback:', err);
        return session;
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'mandalbook_secret_key_2026_super_secure_production_token',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
