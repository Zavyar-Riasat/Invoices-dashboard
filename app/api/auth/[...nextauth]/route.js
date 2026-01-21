import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";

import bcrypt from "bcrypt";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    // 🔹 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🔹 EMAIL & PASSWORD LOGIN
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // 🔹 GOOGLE USER SAVE
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db
          .collection("users")
          .findOne({ email: user.email });

        if (!existingUser) {
          await db.collection("users").insertOne({
            name: user.name,
            email: user.email,
            image: user.image || "",
            provider: "google",
            role: "user",
            createdAt: new Date(),
          });
        }
      }
      return true;
    },

    // 🔹 ADD ROLE TO JWT
    async jwt({ token }) {
      const client = await clientPromise;
      const db = client.db();

      const dbUser = await db
        .collection("users")
        .findOne({ email: token.email });

      if (dbUser) {
        token.role = dbUser.role;
      }

      return token;
    },

    // 🔹 ADD ROLE TO SESSION
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
