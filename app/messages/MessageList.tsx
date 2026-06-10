interface Message {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="text-center text-zinc-500">暂无留言，快来抢沙发！</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            {msg.user.image ? (
              <img
                src={msg.user.image}
                alt={msg.user.name ?? "用户"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            )}
            <span className="font-semibold">{msg.user.name ?? "匿名用户"}</span>
            <span className="text-xs text-zinc-500">
              {msg.createdAt.toLocaleString()}
            </span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}