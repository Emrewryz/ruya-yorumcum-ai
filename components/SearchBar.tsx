"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({ placeholder = "Ara...", defaultValue = "" }: SearchBarProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef    = useRef<HTMLInputElement>(null);

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    handleSearch("");
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
        {isPending
          ? <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" strokeWidth={1.5} />
          : <Search className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        }
      </div>
      <input
        ref={inputRef}
        type="search"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-zinc-200 bg-white
          py-2.5 pl-10 pr-9 text-sm text-zinc-900
          placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
          transition-all
        "
      />
      {defaultValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-zinc-300 hover:text-zinc-500"
          aria-label="Aramayı temizle"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}