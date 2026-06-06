"use client";

import type { ChatMessage } from "@/app/actions/chat-actions";

interface MessageBubbleProps {
  msg: ChatMessage;
}

export default function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Soru
        </p>
        <div className="border-l-2 border-zinc-800 bg-zinc-50 pl-4 py-2.5 rounded-r-xl">
          <p className="text-sm leading-relaxed text-zinc-800">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        Analiz
      </p>
      <div className="border-l-2 border-zinc-200 bg-white pl-4 py-2.5">
        <p className="text-sm leading-loose text-zinc-600">{msg.content}</p>
        {msg.credits_spent > 0 && (
          <p className="mt-1.5 text-[11px] text-zinc-300">
            {msg.credits_spent} kredi harcandı
          </p>
        )}
      </div>
    </div>
  );
}