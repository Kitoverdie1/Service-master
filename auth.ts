import NextAuth from "next-auth";
// import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { getDataUser } from "./app/itservice/actions";
import { AdapterUser } from "next-auth/adapters";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    department: string;
    role: string;
    email: string;
    emailVerified: Date | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      department: string;
      role: string;
      email: string;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      name: "microsoft-entra-id",
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      const employee = await getDataUser({
        username: token?.email?.split("@")[0] ?? "",
        refId: account?.providerAccountId ?? "",
      });
      token.user = {
        id: employee.id?.toString(),
        username: employee.username,
        email: token.email,
        emailVerified: null,
        first_name: employee.first_name,
        last_name: employee.last_name,
        department: employee.department,
        role: employee.role,
      } as AdapterUser;
      return token;
    },
    session({ session, token }) {
      if (token.user) {
        session.user = token.user as AdapterUser;
      }
      return session;
    },
  },
});
