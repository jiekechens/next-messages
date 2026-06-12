import DeleteButton from "./DeleteButton";

interface Message {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  deleteMessage: (id: number) => Promise<void>;
}

export default function MessageList({
  messages,
  currentUserId,
  deleteMessage,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✍️</div>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          还没有留言，成为第一个发言的人吧！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isOwner = currentUserId && msg.user?.id === currentUserId;
        return (
          <div
            key={msg.id}
            className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {msg.user.image ? (
                  <img
                    src={msg.user.image}
                    alt={msg.user.name ?? "用户"}
                    className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(msg.user.name ?? "匿")[0]}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {msg.user.name ?? "匿名用户"}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {msg.createdAt.toLocaleString()}
                  </span>
                </div>
              </div>

              {isOwner && (
                <DeleteButton id={ msg.id ? Number(msg.id) : msg.id} deleteMessage={deleteMessage} />
              )}
            </div>
            <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}