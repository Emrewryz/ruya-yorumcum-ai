"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/app/actions/chat-actions";

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dreamTitle, setDreamTitle] = useState("");

  // Sayfa Yüklendiğinde Geçmişi Çek
  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Rüya Başlığını Al
      const { data: dream } = await supabase.from('dreams').select('dream_title').eq('id', params.id).single();
      if (dream) setDreamTitle(dream.dream_title);

      // 2. Mesajları Al
      const { data: history } = await supabase
        .from('dream_chat_messages')
        .select('*')
        .eq('dream_id', params.id)
        .order('created_at', { ascending: true });

      if (history) setMessages(history as any);
      setInitialLoading(false);
    };

    fetchHistory();
  }, [params.id, supabase]);

  // Otomatik Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    // Optimistik Update (Hemen ekranda göster)
    const tempMsg: Message = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, tempMsg]);

    // Backend'e Gönder
    const result = await sendChatMessage(params.id, userMsg);

    if (result.success && result.message) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
    } else {
      alert("Hata: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden">
      
      {/* Header */}
      <header className="p-4 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md flex items-center gap-4 z-20">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-serif font-bold text-lg text-[#fbbf24]">Kahin ile Sohbet</h1>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{dreamTitle || "Rüya Analizi"}</p>
        </div>
      </header>

      {/* Mesaj Alanı */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        <div className="fixed inset-0 pointer-events-none bg-noise opacity-50 z-0"></div>
        
        {initialLoading ? (
           <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>
        ) : messages.length === 0 ? (
           <div className="text-center text-gray-500 mt-20 px-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Bu rüya hakkında aklına takılan her şeyi sorabilirsin.</p>
              <p className="text-xs mt-2 opacity-50">"Kırmızı araba neyi simgeliyordu?" gibi...</p>
           </div>
        ) : (
           messages.map((msg, i) => (
             <div key={i} className={`flex gap-3 relative z-10 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center shrink-0 border border-[#fbbf24]/50">
                    <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                  </div>
                )}
                
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#8b5cf6] text-white rounded-tr-none' 
                    : 'bg-[#1e293b] text-gray-200 border border-white/5 rounded-tl-none'
                }`}>
                   {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center shrink-0 border border-[#8b5cf6]/50">
                    <User className="w-4 h-4 text-[#8b5cf6]" />
                  </div>
                )}
             </div>
           ))
        )}
        
        {loading && (
           <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center shrink-0">
                 <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <div className="bg-[#1e293b] p-4 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2">
                 <Loader2 className="w-3 h-3 animate-spin" /> Kahin yazıyor...
              </div>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Alanı */}
      <div className="p-4 bg-[#0f172a] border-t border-white/10 relative z-20">
         <form 
           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
           className="flex items-center gap-2 max-w-4xl mx-auto"
         >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Rüyanla ilgili bir soru sor..." 
              className="flex-1 bg-[#1e293b] text-white placeholder-gray-500 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 border border-white/5 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-4 rounded-full bg-[#fbbf24] text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
               <Send className="w-5 h-5" />
            </button>
         </form>
      </div>

    </div>
  );
}