"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Send, Sparkles, User, Loader2, Bot } from "lucide-react";
import { sendChatMessage } from "@/app/actions/chat-actions";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  }, [messages, loading]);

  // --- YENİ MESAJ GÖNDERME FONKSİYONU ---
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput(""); 
    setLoading(true);

    if (navigator.vibrate) navigator.vibrate(10);

    // Optimistic Update: Kullanıcı mesajını hemen ekranda göster
    const tempMsg: Message = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const result = await sendChatMessage(params.id, userMsg);

      if (result.success && result.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
      } else {
        // Hata Durumu Geri Alma
        setMessages(prev => prev.slice(0, -1)); 
        setInput(userMsg); 

        const err = result as any;
        if (err.error?.includes("Yetersiz") || err.code === "NO_CREDIT") {
            toast.error("Bakiyeniz Yetersiz", {
                description: "Kahin ile konuşmak için 1 krediye ihtiyacınız var.",
                action: {
                    label: "Yükle",
                    onClick: () => router.push("/dashboard/pricing")
                },
                duration: 5000,
            });
        } else {
            toast.error(result.error || "Bağlantı hatası, tekrar deneyin.");
        }
      }
    } catch (error) {
      setMessages(prev => prev.slice(0, -1)); 
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FULL SCREEN TAKEOVER: Çift Tema destekli tam ekran yapı (Mobil klavye dostu: 100dvh)
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#faf9f6] dark:bg-[#0a0c10] text-stone-800 dark:text-slate-200 overflow-hidden h-[100dvh] font-sans selection:bg-amber-500/30 transition-colors duration-500 antialiased">
      
      {/* LOKAL ARKAPLAN IŞIĞI (Sadece karanlık modda daha belirgin) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 dark:from-amber-900/10 via-transparent to-transparent pointer-events-none -z-10 transition-colors"></div>

      {/* --- HEADER (SABİT) --- */}
      <header className="px-4 py-3 md:px-6 md:py-5 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-xl flex items-center justify-between z-20 shrink-0 transition-colors">
        <button 
          onClick={() => router.back()} 
          className="p-2 md:p-2.5 rounded-full bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/10 active:scale-90 transition-colors border border-stone-200 dark:border-white/5 text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="flex flex-col items-center flex-1 px-4">
           <div className="flex items-center gap-2">
               <h1 className="font-serif font-bold text-base md:text-lg text-amber-600 dark:text-amber-500 transition-colors">Rüya Kahini</h1>
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
           </div>
           <p className="text-[10px] md:text-xs text-stone-500 dark:text-slate-500 truncate max-w-[200px] md:max-w-md transition-colors">{dreamTitle || "Rüya Analizi Sohbeti"}</p>
        </div>
        
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 dark:from-amber-600 dark:to-amber-400 flex items-center justify-center shadow-sm dark:shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0 border border-amber-200 dark:border-amber-300/50 transition-colors">
           <Bot className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-[#0a0c10]" />
        </div>
      </header>

      {/* --- MESAJ ALANI --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative scroll-smooth overscroll-contain flex flex-col w-full max-w-4xl mx-auto">
        
        {initialLoading ? (
           <div className="flex flex-col items-center justify-center m-auto gap-4 opacity-70">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-slate-500 transition-colors">Kozmik Bağlantı Kuruluyor...</p>
           </div>
        ) : messages.length === 0 ? (
           <div className="m-auto flex flex-col items-center justify-center text-center px-6 opacity-90 dark:opacity-80 mt-10 md:mt-20">
              <div className="w-20 h-20 bg-stone-50 dark:bg-[#131722] border border-stone-200 dark:border-white/5 rounded-3xl flex items-center justify-center shadow-sm dark:shadow-inner mb-6 rotate-3 transition-colors">
                 <Sparkles className="w-8 h-8 text-amber-500 dark:text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif text-stone-900 dark:text-white mb-2 transition-colors">Kahine Danışın</h2>
              <p className="text-stone-500 dark:text-slate-400 text-xs md:text-sm font-light mb-8 max-w-sm transition-colors leading-relaxed">
                 Rüyanızdaki detayları, uyandığınızda hissettiklerinizi veya sembolleri sorarak analizi derinleştirin.
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-sm">
                 <button onClick={() => setInput("Rüyamdaki bu renkler ne anlama geliyordu?")} className="px-5 py-3.5 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 rounded-xl text-xs md:text-sm text-stone-600 dark:text-slate-300 transition-all text-left shadow-sm dark:shadow-none hover:shadow">
                    "Rüyamdaki bu renkler ne anlama geliyordu?"
                 </button>
                 <button onClick={() => setInput("Uyandığımda hissettiğim o korkunun sebebi ne olabilir?")} className="px-5 py-3.5 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 rounded-xl text-xs md:text-sm text-stone-600 dark:text-slate-300 transition-all text-left shadow-sm dark:shadow-none hover:shadow">
                    "Uyandığımda hissettiğim o korkunun sebebi ne olabilir?"
                 </button>
              </div>
           </div>
        ) : (
           messages.map((msg, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={i} 
               className={`flex gap-3 md:gap-4 relative z-10 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                {/* Asistan İkonu */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-500/20 mt-1 shadow-sm dark:shadow-inner transition-colors">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                )}
                
                {/* Mesaj Balonu */}
                <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed font-light transition-colors ${
                  msg.role === 'user' 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-100 rounded-br-sm shadow-sm dark:shadow-[0_5px_15px_rgba(99,102,241,0.05)]' 
                    : 'bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/5 text-stone-700 dark:text-slate-300 rounded-bl-sm shadow-sm dark:shadow-xl'
                }`}>
                   {msg.content}
                </div>

                {/* Kullanıcı İkonu */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 mt-1 shadow-sm dark:shadow-inner transition-colors">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                )}
             </motion.div>
           ))
        )}
        
        {/* Yazıyor Animasyonu */}
        {loading && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 md:gap-4 justify-start relative z-10 w-full">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-500/20 mt-1 transition-colors">
                 <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="bg-white dark:bg-[#131722] px-5 py-4 rounded-3xl rounded-bl-sm text-xs md:text-sm text-stone-500 dark:text-slate-400 flex items-center gap-3 border border-stone-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors">
                 <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Kahin düşünüyor...
              </div>
           </motion.div>
        )}
        
        {/* Scroll Çıpası */}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* --- INPUT ALANI (SABİT ALT) --- */}
      {/* iOS ve Android klavye optimizasyonu: safe-area-inset-bottom */}
      <div className="bg-white/90 dark:bg-[#0a0c10]/90 backdrop-blur-2xl border-t border-stone-200 dark:border-white/5 p-3 md:p-5 relative z-20 shrink-0 transition-colors" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
         <form 
           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
           className="flex items-end gap-2 max-w-4xl mx-auto bg-stone-50 dark:bg-[#131722] p-2 rounded-[2rem] border border-stone-200 dark:border-white/10 focus-within:border-amber-400 dark:focus-within:border-amber-500/40 transition-colors shadow-sm dark:shadow-inner"
         >
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                 }
              }}
              placeholder="Kahine bir soru sor... (1 Kredi)" 
              rows={1}
              className="flex-1 bg-transparent text-stone-800 dark:text-slate-200 text-sm md:text-base placeholder-stone-400 dark:placeholder-slate-600 px-4 py-3 md:py-4 focus:outline-none resize-none max-h-32 min-h-[44px] md:min-h-[52px] scrollbar-hide transition-colors"
            />
            
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-3 md:p-4 rounded-2xl bg-amber-500 text-white dark:text-[#0a0c10] hover:bg-amber-600 dark:hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 shadow-sm dark:shadow-[0_0_20px_rgba(251,191,36,0.3)] shrink-0 m-1"
            >
               <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
         </form>
      </div>

    </div>
  );
}