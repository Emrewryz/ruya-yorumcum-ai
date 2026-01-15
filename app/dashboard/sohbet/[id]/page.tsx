"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Send, Sparkles, User, Loader2 ,Bot} from "lucide-react";
import { sendChatMessage } from "@/app/actions/chat-actions";
import { motion, AnimatePresence } from "framer-motion";

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

  // Otomatik Scroll (Her mesajda en alta kaydır)
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    // Haptik titreşim (Mobil destekliyorsa)
    if (navigator.vibrate) navigator.vibrate(10);

    // Optimistik Update (Hemen ekranda göster)
    const tempMsg: Message = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, tempMsg]);

    // Backend'e Gönder
    try {
      const result = await sendChatMessage(params.id, userMsg);
      if (result.success && result.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
      } else {
        // Hata durumunda son mesajı geri alabilir veya hata gösterebilirsin
        alert("Bağlantı koptu, tekrar dene.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // APP FIX: fixed inset-0 z-[60] ile bu sayfa alt menünün (MobileNav) ÜZERİNE biner. Tam odak modu.
    // APP FIX: h-[100dvh] mobil tarayıcı çubuğu sorununu çözer.
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#020617] text-white overflow-hidden">
      
      {/* --- HEADER (SABİT) --- */}
      <header className="px-4 py-3 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-md flex items-center gap-3 z-20 shadow-lg">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <h1 className="font-serif font-bold text-base text-[#fbbf24]">Kahin</h1>
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{dreamTitle || "Rüya Analizi Sohbeti"}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fbbf24] to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]">
           <Bot className="w-5 h-5 text-black" />
        </div>
      </header>

      {/* --- MESAJ ALANI --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative scroll-smooth">
        {/* Arka Plan Gürültüsü */}
        <div className="fixed inset-0 pointer-events-none bg-noise opacity-50 z-0"></div>
        
        {initialLoading ? (
           <div className="flex flex-col items-center justify-center pt-32 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
              <p className="text-xs text-gray-500 animate-pulse">Bağlantı kuruluyor...</p>
           </div>
        ) : messages.length === 0 ? (
           <div className="text-center text-gray-500 mt-20 px-6 opacity-60">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50 text-[#fbbf24]" />
              <p className="text-sm">Bu rüya hakkında aklına takılanları sor.</p>
              <p className="text-xs mt-2 opacity-50">"Kırmızı araba neyi simgeliyordu?"</p>
           </div>
        ) : (
           messages.map((msg, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={i} 
               className={`flex gap-3 relative z-10 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                {/* Asistan İkonu */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center shrink-0 border border-[#fbbf24]/30 mt-1">
                    <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                  </div>
                )}
                
                {/* Mesaj Balonu */}
                <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#8b5cf6] text-white rounded-tr-none shadow-[0_4px_15px_rgba(139,92,246,0.3)]' 
                    : 'bg-[#1e293b] text-gray-200 border border-white/5 rounded-tl-none'
                }`}>
                   {msg.content}
                </div>

                {/* Kullanıcı İkonu (Opsiyonel, mobilde yer kaplamasın diye gizlenebilir ama şık durur) */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center shrink-0 border border-[#8b5cf6]/30 mt-1">
                    <User className="w-4 h-4 text-[#8b5cf6]" />
                  </div>
                )}
             </motion.div>
           ))
        )}
        
        {/* Yazıyor Animasyonu */}
        {loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center shrink-0">
                 <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <div className="bg-[#1e293b] px-4 py-3 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2 border border-white/5">
                 <Loader2 className="w-3 h-3 animate-spin" /> Kahin düşünüyor...
              </div>
           </motion.div>
        )}
        
        {/* Scroll Anchor */}
        <div ref={scrollRef} className="h-2" />
      </div>

      {/* --- INPUT ALANI (SABİT ALT) --- */}
      <div className="p-3 md:p-4 bg-[#020617] border-t border-white/10 relative z-20 pb-safe">
         <form 
           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
           className="flex items-center gap-2 max-w-4xl mx-auto"
         >
            {/* APP FIX: text-base (Mobilde zoom'u engeller) */}
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajını yaz..." 
              className="flex-1 bg-[#1e293b] text-white text-base placeholder-gray-500 rounded-full px-5 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 border border-white/5 transition-all shadow-inner"
            />
            {/* APP FIX: active:scale-90 (Dokunma hissi) */}
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-3 md:p-4 rounded-full bg-[#fbbf24] text-black hover:scale-105 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            >
               <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
         </form>
      </div>

    </div>
  );
}