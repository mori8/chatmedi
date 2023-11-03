import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {

  },
  events: {
    signIn: async ({ user }) => {
      const res = await fetch(`${process.env.SERVER_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          full_name: user.name,
          avatar_url: user.image,
        }),
      });

      if (!res.ok) {
        throw new Error("[route.ts: events/signIn] Failed to save new user to server");
      }
    },
  },
});

export { handler as GET, handler as POST };
