import NextAuth, { User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { AdapterUser } from "next-auth/adapters";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: UpstashRedisAdapter(redis),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user }) {
      await redis.hset(`user:${user.email}`, {
        email: user.email,
        name: user.name,
        image: user.image,
      });
      return true;
    },
  }
});

export { handler as GET, handler as POST };
