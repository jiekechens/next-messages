import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // 💡 确保路径指向你刚刚建的 prisma.ts

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1. 让 Auth.js 自动把用户信息、Session 存入你的 SQLite 数据库
  adapter: PrismaAdapter(prisma),
  
  // 2. 配置登录策略：本地开发首推 JWT 策略，省心且高效
  session: { strategy: "jwt" },
    callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;   // 关键：注入数据库中的用户 ID
      }
      return session;
    },
  },
  // 3. 配置登录提供商
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
});