import NextAuth from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(user) {
        if (user) return user;
        return null;
      },
    }),
      Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },

  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.role = user.role;
      token.avatar = user.avatar;
      token.referralCode = user.referralCode;
      token.referredById = user.referredById;
      token.accessToken = user.accessToken;
      token.storeId = user.storeId;
    }
    return token;
  },


   async session({ token, session }: { token: JWT; session: Session }) {
    session.user = {
      id: token.id as string,
      name: token.name as string,
      email: token.email as string,
      role: token.role as string,
      referralCode: token.referralCode as string,
      referredById: token.referredById as string,
      avatar: token.avatar as string,
      storeId: token.storeId as string,
    };

    session.accessToken = token.accessToken as string;
    return session;
  },
},
});
