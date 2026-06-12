"use client";

import { useRef } from "react";

interface MessageFormProps {
  addMessage: (formData: FormData) => Promise<void>;
}

export default function MessageForm({ addMessage }: MessageFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await addMessage(formData);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50"
    >
      <textarea
        name="content"
        required
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
        placeholder="说点什么..."
      />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-400">支持 Markdown 语法</span>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          💬 发表留言
        </button>
      </div>
    </form>
  );
}