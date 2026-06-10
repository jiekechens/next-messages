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
      className="mb-10 p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">留言</label>
        <textarea
          name="content"
          required
          rows={3}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent"
          placeholder="说点什么..."
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        提交留言
      </button>
    </form>
  );
}