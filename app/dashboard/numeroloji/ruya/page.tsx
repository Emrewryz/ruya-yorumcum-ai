"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Zap } from "lucide-react";
import { explainNumbers } from "@/app/actions/explain-numerology";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

function DreamNumerologyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const dreamId = searchParams.get('dreamId');
  const numbersParam = searchParams.get('numbers');
  const numbers = numbersParam ? numbersParam.split(',').map(Number) : [];

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sayfa açıldığında daha önce analiz var mı kontrol et
  useEffect(() => {
    if(!dreamId) return;
    const checkExisting = async () => {
        const { data } = await supabase.from('numerology_reports').select('analysis').eq('dream_id', dreamId).single();
        if(data) setResult(data.analysis);
    };
    checkExisting();
  }, [dreamId]);

  const handleAnalysis = async () => {
    if (!dreamId || numbers.length === 0) return;
    setLoading(true);
    const res = await explainNumbers(numbers, dreamId);
    
    if (res.success) {
      setResult(res.data);
      toast.success("Kozmik Bağlantı Çözüldü!");
    } else {
      toast.error(res.error || "Hata oluştu");
    }
    setLoading(false);
  };

  if (!dreamId) return <div className="text-white text-center p-10">Rüya verisi bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4"/> Geri</button>
      </div>

      {result ? (
        <div className="max-w-2xl w-full bg-[#0f172a] border border-indigo-500/30 p-8 rounded-3xl animate-in fade-in zoom-in-95">
           <h2 className="text-3xl font-serif text-indigo-300 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#fbbf24]" /> Rüya & Yaşam Yolu Uyumu
           </h2>
           <div className="space-y-4">
              {result.numbers?.map((item: any, i: number) => (
                  <div key={i} className="bg-black/30 p-4 rounded-xl border border-indigo-500/10">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-indigo-400 font-mono">{item.number}</span>
                          <span className="text-white font-bold text-sm uppercase">{item.title}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{item.meaning}</p>
                  </div>
              ))}
              <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/20 mt-6">
                 <h3 className="font-bold text-white mb-2">Genel Sentez</h3>
                 <p className="text-gray-300">{result.life_analysis}</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="max-w-lg w-full text-center mt-10">
           <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
              <div className="relative z-10 flex gap-4">
                 {numbers.map((n, i) => (
                    <div key={i} className="w-16 h-20 bg-indigo-900/40 border border-indigo-500/50 rounded-xl flex items-center justify-center text-2xl font-mono text-indigo-300 shadow-xl">
                       {n}
                    </div>
                 ))}
              </div>
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-4">Bu sayılar size ne anlatıyor?</h2>
           <p className="text-gray-400 mb-8">
             Rüyanızdaki bu sayıların, sizin doğum haritanız ve Yaşam Yolu sayınızla olan gizli ilişkisini analiz etmek üzeresiniz.
           </p>

           <button 
             onClick={handleAnalysis} 
             disabled={loading}
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
             {loading ? "Analiz Ediliyor..." : "Kozmik Uyumu Analiz Et (2 Kredi)"}
           </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <DreamNumerologyContent />
    </Suspense>
  );
}