"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Send, Sparkles, User, Loader2, Bot } from "lucide-react";
import { sendChatMessage } from "@/app/actions/chat-actions";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Toast bildirimi eklendi

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
    setInput(""); // Inputu temizle
    setLoading(true);

    if (navigator.vibrate) navigator.vibrate(10);

    // Optimistic Update: Kullanıcı mesajını hemen ekranda göster
    const tempMsg: Message = { role: 'user', content: userMsg };
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Server Action'ı çağır (Kredi kontrolü burada yapılır)
      const result = await sendChatMessage(params.id, userMsg);

      if (result.success && result.message) {
        // Başarılı: AI cevabını ekle
        setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
      } else {
        // --- HATA YÖNETİMİ ---
        
        // Eklenen son mesajı geri al (Çünkü işlem başarısız oldu)
        setMessages(prev => prev.slice(0, -1)); 
        setInput(userMsg); // Kullanıcının yazdığı metni geri getir

        // Kredi Hatası Kontrolü
        // Backend 'error' string'i içinde "Yetersiz" kelimesi geçiyorsa veya code 'NO_CREDIT' ise
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
      console.error(error);
      setMessages(prev => prev.slice(0, -1)); // Hata varsa mesajı geri al
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // APP FIX: fixed inset-0 z-[60] ile bu sayfa alt menünün (MobileNav) ÜZERİNE biner.
    // h-[100dvh] mobil tarayıcı çubuğu sorununu çözer.
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#020617] text-white overflow-hidden h-[100dvh]">
      
      {/* --- HEADER (SABİT) --- */}
      <header className="px-4 py-3 border-b border-white/10 bg-[#0f172a]/90 backdrop-blur-md flex items-center gap-3 z-20 shadow-lg shrink-0">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <h1 className="font-serif font-bold text-base text-[#fbbf24]">Kahin</h1>
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <p className="text-xs text-gray-400 truncate">{dreamTitle || "Rüya Analizi Sohbeti"}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fbbf24] to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)] shrink-0">
           <Bot className="w-5 h-5 text-black" />
        </div>
      </header>

      {/* --- MESAJ ALANI --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative scroll-smooth overscroll-contain">
        {/* Arka Plan Gürültüsü */}
        <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 z-0"></div>
        
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

                {/* Kullanıcı İkonu */}
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
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start relative z-10">
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
      {/* pb-safe: iPhone X alt çizgisi için güvenli alan bırakır */}
      <div className="p-3 md:p-4 bg-[#020617] border-t border-white/10 relative z-20 shrink-0 safe-area-pb">
         <form 
           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
           className="flex items-center gap-2 max-w-4xl mx-auto"
         >
            {/* TEXT-BASE: iOS zoom engellemek için kritik */}
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajını yaz... (1 Kredi)" 
              className="flex-1 bg-[#1e293b] text-white text-base placeholder-gray-500 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 border border-white/5 transition-all shadow-inner"
            />
            
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-3 rounded-full bg-[#fbbf24] text-black hover:scale-105 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            >
               <Send className="w-5 h-5" />
            </button>
         </form>
         {/* iPhone Alt Çizgi Boşluğu */}
         <div className="h-4 md:h-0 w-full"></div> 
      </div>

    </div>
  );
}