import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";

import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* ① 改为 h-screen + overflow-hidden，强制全屏禁止整页滚动 */}
      <body className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
            {/* 导航内容保持不变 */}
            <Link href="/" className="...">留言板</Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/messages" className="...">浏览留言</Link>
              <a href="https://github.com/jiekechens/next-messages" target="_blank" rel="noopener noreferrer" className="...">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">...</svg>
              </a>
            </div>
          </nav>
        </header>

        {/* ② 中间可滚动的区域：flex-1 占满剩余空间，overflow-y-auto 内部滚动 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}