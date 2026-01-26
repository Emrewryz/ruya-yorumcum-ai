"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Zap, Crown, UserCheck } from "lucide-react";

export default function AdminPanel() {
  const supabase = createClient();
  const [targetEmail, setTargetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sadece SEN girebil (Kendi emailini buraya yaz)
  const ADMIN_EMAIL = "fikriemretopcu07@gmail.com";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });
  }, []);

  const manuelActivate = async (plan: 'pro' | 'elite') => {
    if(!targetEmail) return;
    setLoading(true);

    try {
        // API Route'a istek atıyoruz çünkü Client tarafında RLS engeli olabilir
        // Ama şimdilik basit bir RPC veya Update deniyoruz.
        // NOT: Burası Client-side update. Eğer RLS izin vermezse çalışmaz.
        // En doğrusu bu işlemi de bir API route üzerinden yapmaktır ama
        // hızlı çözüm için veritabanında "Profiles tablosunu herkes update edebilir"
        // dersen güvenlik açığı olur.
        
        // GÜVENLİ YOL: Bu işlemi de üstteki webhook mantığıyla bir API'ye bağlamak.
        // Ama şimdilik Supabase panelinden manuel yapmak en kolayıdır.
        // Biz burada basit bir UI koyalım, eğer RLS izin verirse çalışır.
        
        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: plan,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('email', targetEmail);

        if (error) throw error;
        toast.success(`${targetEmail} için ${plan} tanımlandı!`);
        
    } catch (e: any) {
        toast.error("Hata: " + e.message);
        toast.info("Supabase RLS ayarlarını kontrol et veya panelden yap.");
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
             Kullanıcı yanlış mail ile ödeme yaparsa buradan düzelt.
             Kullanıcının <b>sitedeki</b> mailini gir.
          </p>

          <input 
            type="email" 
            placeholder="Kullanıcının Sitedeki Maili (örn: ahmet@gmail.com)"
            className="w-full bg-black/50 border border-white/20 p-4 rounded-xl mb-6 text-white"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => manuelActivate('pro')} disabled={loading} className="bg-blue-900/50 border border-blue-500/50 p-4 rounded-xl hover:bg-blue-900 transition flex items-center justify-center gap-2">
                <Zap className="text-blue-400"/> KAŞİF VER
             </button>
             <button onClick={() => manuelActivate('elite')} disabled={loading} className="bg-amber-900/50 border border-amber-500/50 p-4 rounded-xl hover:bg-amber-900 transition flex items-center justify-center gap-2">
                <Crown className="text-amber-400"/> KAHİN VER
             </button>
          </div>
       </div>
    </div>
  );
}