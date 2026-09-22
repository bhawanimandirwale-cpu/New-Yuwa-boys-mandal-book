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

        const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com';

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            email: normalizedEmail,
            name: isAdmin ? 'श्री. निलेश पाटील (अध्यक्ष)' : normalizedEmail.split('@')[0],
            role: isAdmin ? 'SUPER_ADMIN' : 'USER',
          });
        } else if (isAdmin && user.role !== 'SUPER_ADMIN') {
          user.role = 'SUPER_ADMIN';
          await user.save();
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
            name: isAdmin ? 'श्री. निलेश पाटील (अध्यक्ष)' : (user.name || normalizedEmail.split('@')[0]),
            avatarUrl: user.image || '',
            role: isAdmin ? 'SUPER_ADMIN' : 'USER',
          });
        } else if (isAdmin && dbUser.role !== 'SUPER_ADMIN') {
          dbUser.role = 'SUPER_ADMIN';
          await dbUser.save();
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
    async jwt({ token }) {
      if (token.email) {
        await connectToDatabase();
        const normalizedEmail = token.email.toLowerCase().trim();
        const isAdmin = normalizedEmail === 'bhawanimandirwale@gmail.com';

        const dbUser = await User.findOne({ email: normalizedEmail });
        if (dbUser) {
          token.id = dbUser._id.toString();
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id || token.sub;
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
