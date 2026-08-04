import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin) {
          return null;
        }

        const isValid = await verifyPassword(password, admin.passwordHash);
        if (!isValid) {
          return null;
        }

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
});
