import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaInstance: PrismaClient;

// 1. 💡 第一重安全锁：严防客户端浏览器初始化
const isServer = typeof window === "undefined";

if (!isServer) {
  // 如果在浏览器，给一个安全的代理对象，坚决不初始化底层驱动
  prismaInstance = new Proxy({}, {
    get() { throw new Error("⚠️ 警告：严禁在前端浏览器中直接调用 Prisma！"); }
  }) as unknown as PrismaClient;
} else {
  // 2. 💡 第二重安全锁：服务端拦截 Trae 干扰，锁定本地路径
  const rawUrl = process.env.DATABASE_URL || "";
  const isProductionDb = rawUrl && !rawUrl.includes("prisma+postgres") && !rawUrl.startsWith("localhost");
  
  // 本地开发时，LibSQL 驱动读取相对路径的标准格式是 "file:./prisma/dev.db"
  const targetUrl = isProductionDb ? rawUrl : "file:./prisma/dev.db";

  // 3. 实例化适配器
  const adapter = new PrismaLibSql({ url: targetUrl });

  // 4. 正式实例化 Prisma 客户端
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;