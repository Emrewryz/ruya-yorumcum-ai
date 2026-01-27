"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Zap, Crown, Loader2 } from "lucide-react";

export default function AdminPanel() {
  const supabase = createClient();
  const [targetEmail, setTargetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kendi Emailin
  const ADMIN_EMAIL = "fikriemretopcu07@gmail.com";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });
  }, []);

  // app/dashboard/admin/page.tsx (veya admin panelin nerdeyse)

// app/dashboard/admin/page.tsx (veya admin panelin nerdeyse)

const manuelActivate = async (plan: 'pro' | 'elite') => {
    if(!targetEmail) return toast.error("Mail adresi giriniz");
    setLoading(true);

    try {
        const response = await fetch('/api/admin/assign-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, plan }),
        });

        // ÖNCE TEXT OLARAK AL (Hata ayıklama için kritik)
        const rawText = await response.text();
        
        console.log("Sunucudan gelen ham cevap:", rawText); // F12 Konsoluna bak

        let data;
        try {
            data = JSON.parse(rawText); // Şimdi JSON'a çevirmeyi dene
        } catch (e) {
            throw new Error(`Sunucu JSON döndürmedi: ${rawText.substring(0, 50)}...`);
        }

        if (!response.ok) throw new Error(data.error || 'İşlem başarısız');

        toast.success(`${targetEmail} başarıyla ${plan.toUpperCase()} yapıldı!`);
        setTargetEmail(""); 
        
    } catch (e: any) {
        console.error(e);
        toast.error("Hata: " + e.message);
    } finally {
        setLoading(false);
    }
};
  if (!isAdmin) return <div className="p-20 text-center text-white">Yetkisiz Giriş</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10 pt-32 max-w-3xl mx-auto">
       <div className="border border-white/10 bg-white/5 p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#fbbf24]">
             <ShieldCheck /> Acil Durum Paneli
          </h1>
          <p className="text-gray-400 mb-6 text-sm">
             Kullanıcı yanlış mail ile ödeme yaparsa veya sistem çalışmazsa buradan düzelt.
             Kullanıcının <b>sitedeki</b> mailini gir.
          </p>

          <input 
            type="email" 
            placeholder="Kullanıcının Sitedeki Maili (örn: ahmet@gmail.com)"
            className="w-full bg-black/50 border border-white/20 p-4 rounded-xl mb-6 text-white focus:border-[#fbbf24] outline-none transition"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => manuelActivate('pro')} 
                disabled={loading} 
                className="bg-blue-900/20 border border-blue-500/50 p-6 rounded-xl hover:bg-blue-900/40 transition flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin"/> : <Zap className="w-8 h-8 text-blue-400 group-hover:scale-110 transition"/>}
                <span className="font-bold text-blue-200">KAŞİF VER</span>
             </button>

             <button 
                onClick={() => manuelActivate('elite')} 
                disabled={loading} 
                className="bg-amber-900/20 border border-amber-500/50 p-6 rounded-xl hover:bg-amber-900/40 transition flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin"/> : <Crown className="w-8 h-8 text-amber-400 group-hover:scale-110 transition"/>}
                <span className="font-bold text-amber-200">KAHİN VER</span>
             </button>
          </div>
       </div>
    </div>
  );
}