import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Mandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
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

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            role: 'USER',
          });
        }

        const mandal = await Mandal.findOne();
        let role = 'VOLUNTEER';
        if (mandal) {
          let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
          if (!member) {
            member = await MandalMember.create({
              mandalId: mandal._id,
              userId: user._id,
              role: 'VOLUNTEER',
              status: 'ACTIVE',
            });
          }
          role = member.role;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role,
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
        let dbUser = await User.findOne({ email: normalizedEmail });

        if (!dbUser) {
          dbUser = await User.create({
            email: normalizedEmail,
            name: user.name || normalizedEmail.split('@')[0],
            avatarUrl: user.image || '',
            role: 'USER',
          });
        }

        const mandal = await Mandal.findOne();
        if (mandal) {
          const member = await MandalMember.findOne({ mandalId: mandal._id, userId: dbUser._id });
          if (!member) {
            await MandalMember.create({
              mandalId: mandal._id,
              userId: dbUser._id,
              role: 'VOLUNTEER',
              status: 'ACTIVE',
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'VOLUNTEER';
        token.mandalId = (user as any).mandalId;
      } else if (!token.role && token.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          const mandal = await Mandal.findOne();
          if (mandal) {
            token.mandalId = mandal._id.toString();
            const member = await MandalMember.findOne({ mandalId: mandal._id, userId: dbUser._id });
            token.role = member ? member.role : 'VOLUNTEER';
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || 'VOLUNTEER';
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
