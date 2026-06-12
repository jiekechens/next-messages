import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";

async function getMessages() {
  return await prisma.message.findMany({
    where: { deleted: false },  // 只获取未删除的留言
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

async function addMessage(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("请先登录");
  }

  const content = formData.get("content") as string;
  if (!content) {
    throw new Error("留言内容不能为空");
  }

  await prisma.message.create({
    data: {
      content,
      userId: session.user.id,
    },
  });

  revalidatePath("/messages");
}

async function deleteMessage(id: number) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("请先登录");
  }

  // 查找留言，只有作者本人或你可以添加管理员逻辑，这里只允许作者删除
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message || message.userId !== session.user.id) {
    throw new Error("无权删除");
  }

  // 伪删除：将 deleted 设置为 true
  await prisma.message.update({
    where: { id },
    data: { deleted: true },
  });

  revalidatePath("/messages");
}

export default async function MessagesPage() {
  const session = await auth();
  const messages = await getMessages();
  const currentUserId = session?.user?.id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-2xl mx-auto px-4 py-12">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            💬 留言板
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            畅所欲言，与世界分享你的想法
          </p>
        </div>

        {session ? (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              {session?.user?.image && (
                <img
                  src={session?.user?.image || ""}
                  alt="头像"
                  className="w-10 h-10 rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {session?.user?.name || ""}
                </p>
                <a
                  href="/api/auth/signout"
                  className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
                >
                  退出登录
                </a>
              </div>
            </div>
            <MessageForm addMessage={addMessage} />
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                登录后即可留言参与讨论
              </p>
              <a
                href="/api/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                使用 GitHub 登录
              </a>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          deleteMessage={deleteMessage}
        />
      </div>
    </main>
  );
}