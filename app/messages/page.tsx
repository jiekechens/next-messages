import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";

async function getMessages() {
  return await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

async function addMessage(formData: FormData) {
  "use server";
  const session = await auth();
  console.log(session?.user);
  if (!session?.user?.id) {
    throw new Error("请先登录");
  }

  const content = formData.get("content") as string;
  if (!content) {
    throw new Error("留言内容不能为空");
  }

  // 💡 修正：拿掉 name 字段，只存内容和绑定的用户 ID
  await prisma.message.create({
    data: {
      content,
      userId: session.user.id,
    },
  });

  revalidatePath("/messages");
}

export default async function MessagesPage() {
  const session = await auth();
  const messages = await getMessages();
  console.log(messages);
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">留言板</h1>
        {session ? (
          <>
            <p className="text-center mb-4">
              欢迎，{session.user?.name || "匿名用户"}
            </p>
            <MessageForm addMessage={addMessage} />
          </>
        ) : (
          <div className="text-center">
            <p className="mb-4">请先登录后留言</p>
            <a
              href="/api/auth/signin"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              登录
            </a>
          </div>
        )}
        <MessageList messages={messages} />
        {session && (
          <div className="text-center mt-4">
            <a
              href="/api/auth/signout"
              className="text-red-500 hover:text-red-600"
            >
              登出
            </a>
          </div>
        )}
      </div>
    </main>
  );
}