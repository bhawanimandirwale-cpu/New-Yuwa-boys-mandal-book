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

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          user = await User.create({
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            role: 'USER',
          });
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
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
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
