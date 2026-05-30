"use client";

import type { ChatMessage } from "@/app/actions/chat-actions";

function safeLines(text: string | null | undefined): string[] {
  if (!text) return [""];
  return text.split("\n");
}

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const lines  = safeLines(msg.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-zinc-900 text-white rounded-br-sm"
          : "bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-sm"
        }
      `}>
        {lines.map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-2" : "mb-1 last:mb-0"}>
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    </div>
  );
}