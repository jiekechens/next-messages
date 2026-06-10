import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  // 💡 核心修正：单独抽离 Server Action 函数，必须全部小写 "use server"
  const handleSignIn = async () => {
    "use server";
    await signIn("github");
  };

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {session?.user ? (
        <div className="text-center bg-white p-6 rounded-xl shadow-md">
          <p className="mb-4 text-lg font-medium text-gray-800">
            欢迎回来，<span className="text-blue-600">{session.user.name}</span>！
          </p>
          {session.user.image && (
            <img 
              src={session.user.image} 
              alt="avatar" 
              className="w-16 h-16 rounded-full mx-auto mb-6 border-2 border-gray-200" 
            />
          )}
          {/* 💡 绑定抽离出来的标准 Action */}
          <form action={handleSignOut}>
            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
              退出登录
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">欢迎来到新项目</h1>
          {/* 💡 绑定抽离出来的标准 Action */}
          <form action={handleSignIn}>
            <button type="submit" className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
              使用 GitHub 账号登录
            </button>
          </form>
        </div>
      )}
    </div>
  );
}