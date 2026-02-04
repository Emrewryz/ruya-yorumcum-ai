"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, User, Calendar, Loader2 } from "lucide-react";
import { getNumerologyReading } from "@/app/actions/calculate-numerology";
import { toast } from "sonner";

export default function GeneralNumerologyPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ fullName: "", birthDate: "" });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Kullanıcı verisini ve varsa eski analizi çek
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase.from('personal_numerology').select('*').eq('user_id', user.id).single();
      if (existing) {
        setResult({ ...existing.analysis, lifePath: existing.life_path_number, destiny: existing.destiny_number });
      } else {
        const { data: profile } = await supabase.from('profiles').select('full_name, birth_date').eq('id', user.id).single();
        if (profile) setFormData({ fullName: profile.full_name || "", birthDate: profile.birth_date || "" });
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await getNumerologyReading(formData);
    if (res.success) {
      setResult(res.data);
      toast.success("Analiz Tamamlandı!");
    } else {
      toast.error(res.error || "Hata oluştu");
    }
    setLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4"/> Geri</button>
      </div>

      {result ? (
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-serif text-emerald-400 mb-6">Kişisel Numeroloji Raporu</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/20">
                <div className="text-sm text-gray-400">Yaşam Yolu</div>
                <div className="text-4xl font-bold text-white">{result.lifePath}</div>
             </div>
             <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/20">
                <div className="text-sm text-gray-400">Kader Sayısı</div>
                <div className="text-4xl font-bold text-white">{result.destiny}</div>
             </div>
          </div>
          <p className="text-gray-300 leading-relaxed">{result.synthesis || result.life_path_desc}</p>
          <button onClick={() => setResult(null)} className="mt-6 w-full py-3 bg-white/5 rounded-xl text-sm">Yeni Analiz</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
            <h1 className="text-3xl font-serif text-white text-center mb-6">Kişisel Analiz Formu</h1>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-1">İsim Soyisim</label>
               <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white" />
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-1">Doğum Tarihi</label>
               <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white" />
               </div>
            </div>
            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
               <Sparkles className="w-5 h-5" /> Analizi Başlat (2 Kredi)
            </button>
        </form>
      )}
    </div>
  );
}