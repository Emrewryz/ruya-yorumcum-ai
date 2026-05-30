"use client";

import { Loader2, ArrowUp } from "lucide-react";

export default function StickyInput({
  value, onChange, onSubmit, disabled, placeholder, minLength = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  const isValid = (value?.trim()?.length ?? 0) >= minLength;
  const MAX = 1200;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isValid && !disabled) onSubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
    if ((el.value?.length ?? 0) <= MAX) onChange(el.value);
  }

  return (
    <div className="relative w-full rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_2px_24px_rgba(0,0,0,0.11)] focus-within:border-zinc-300">
      <textarea
        value={value ?? ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? "Yazın..."}
        rows={3}
        style={{ resize: "none", minHeight: "80px" }}
        className="w-full bg-transparent px-4 pt-4 pb-10 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
      />
      <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
        <span className={`text-xs tabular-nums ${(value?.length ?? 0) > MAX * 0.9 ? "text-amber-500" : "text-zinc-300"}`}>
          {(value?.length ?? 0) > 0 ? `${value.length}/${MAX}` : ""}
        </span>
        <div className="flex items-center gap-2">
          {!isValid && (value?.length ?? 0) > 0 && (
            <span className="text-xs text-zinc-300">
              {minLength - (value?.trim()?.length ?? 0)} karakter daha
            </span>
          )}
          <button
            onClick={onSubmit}
            disabled={!isValid || disabled}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white transition-all hover:bg-zinc-700 disabled:bg-zinc-100 disabled:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            aria-label="Gönder"
          >
            {disabled
              ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              : <ArrowUp className="h-4 w-4" strokeWidth={2} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}