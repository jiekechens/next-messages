import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  const handleSignIn = async () => {
    "use server";
    await signIn("github");
  };

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <main className=" flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      {session?.user ? (
        // ✅ 已登录：个人归属感 + 行动引导
        <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 p-8 border border-gray-100 dark:border-gray-800">
            {/* 头像 */}
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "头像"}
                className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-blue-100 dark:ring-blue-900/50"
              />
            )}
            {/* 欢迎语 */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              欢迎回来，{session.user.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              准备好分享新的想法了吗？
            </p>

            {/* 操作按钮组 */}
            <div className="space-y-3">
              <a
                href="/messages"
                className="block w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                进入留言板
              </a>

              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // ✅ 未登录：价值主张 + 信任建设
        <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            欢迎来到 <span className="text-blue-600 dark:text-blue-400">留言板</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            一个简洁、优雅的地方，用 GitHub 账号登录，分享你的想法，连接世界。
          </p>

          {/* 登录卡片 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 p-8 border border-gray-100 dark:border-gray-800">
            <form action={handleSignIn}>
              <button
                type="submit"
                className="group w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-black/30 flex items-center justify-center gap-3"
              >
                {/* GitHub 图标 */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                使用 GitHub 账号登录
              </button>
            </form>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
              登录即表示同意服务条款，我们不会获取你的私人仓库权限。
            </p>
          </div>

          {/* 信任徽章 */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              安全登录
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              极速体验
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              开源透明
            </span>
          </div>
        </div>
      )}
    </main>
  );
}