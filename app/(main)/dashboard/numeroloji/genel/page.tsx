"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Calendar, Calculator, Loader2, Sparkles, 
  Hash, Binary, Crown, Palette, Ghost, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import { getPersonalNumerology, createNumerologyAnalysis } from "@/app/actions/get-numerology";

export default function GeneralNumerologyPage() {
  const router = useRouter();
  
  // --- STATE YÖNETİMİ ---
  const [loading, setLoading] = useState(true); // Sayfa ilk açılış yüklemesi
  const [calculating, setCalculating] = useState(false); // AI hesaplama süreci
  const [report, setReport] = useState<any>(null); // Numeroloji Raporu
  
  // Form Verileri
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // 1. Sayfa Yüklenince: Veritabanını Kontrol Et
  useEffect(() => {
    const checkExistingData = async () => {
      try {
        // Backend'den veriyi iste
        const result = await getPersonalNumerology();
        
        if (result.success && result.data) {
          // Veri varsa rapora yükle
          setReport(result.data);
        } else {
          // Veri yoksa form gösterilecek (report null kalır)
          
          // Eğer Landing Page'den gelen veri varsa onu forma doldur
          if (typeof window !== 'undefined') {
             const pending = localStorage.getItem("pending_numerology_data");
             if (pending) {
                const { fullName: fn, birthDate: bd } = JSON.parse(pending);
                setFullName(fn || "");
                setBirthDate(bd || "");
                // Kullandıktan sonra sil
                localStorage.removeItem("pending_numerology_data"); 
             }
          }
        }
      } catch (e) {
        console.error("Veri çekme hatası:", e);
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingData();
  }, []);

  // 2. Analiz Başlatma Fonksiyonu (Yeni Oluşturma)
  const handleAnalyze = async () => {
    if (!fullName || !birthDate) {
        toast.warning("Lütfen isim ve doğum tarihini eksiksiz girin.");
        return;
    }

    setCalculating(true);
    
    try {
        // Server Action Çağrısı (Hesapla + Kredi Düş + Kaydet)
        const result = await createNumerologyAnalysis({ fullName, birthDate });
        
        if (result.success) {
            setReport(result.data);
            toast.success("Numeroloji haritanız başarıyla oluşturuldu!");
        } else {
            // Hata Yönetimi
            if (result.code === 'NO_CREDIT') {
                toast.error("Yetersiz Bakiye", {
                    description: "Bu analiz için 2 krediye ihtiyacınız var.",
                    action: { 
                        label: "Yükle", 
                        onClick: () => router.push("/dashboard/pricing") 
                    }
                });
            } else {
                toast.error(result.error || "Bir hata oluştu.");
            }
        }
    } catch (e) {
        toast.error("Beklenmedik bir bağlantı hatası oluştu.");
    } finally {
        setCalculating(false);
    }
  };

  // --- RENDER ---

  // A) Yükleniyor Ekranı (Veri kontrol edilirken)
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm animate-pulse">Kozmik kayıtlar taranıyor...</p>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-32 px-4 pt-6">
      
      {/* BAŞLIK ALANI */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
            {report ? "Ruhsal Kimliğiniz" : "Kişisel Numeroloji"}
        </h1>
        <p className="text-gray-400 text-sm">
            {report 
                ? `${report.fullName}, işte doğumunla gelen şifrelerin.` 
                : "Doğum tarihiniz ve isminizle kaderinizin şifrelerini çözün."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* SENARYO 1: RAPOR YOK -> FORM GÖSTER */}
        {!report ? (
            <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto bg-[#0f172a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
                {/* Dekoratif Arkaplan */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-6 relative z-10">
                    {/* İsim Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tam İsim</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Kimlikteki tam adınız"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Tarih Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Doğum Tarihi</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input 
                                type="date" 
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none min-h-[56px]"
                            />
                        </div>
                    </div>

                    {/* Aksiyon Alanı */}
                    <div className="pt-4">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-4 px-1">
                            <span>Analiz Maliyeti</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                <Crown className="w-3 h-3"/> 2 Kredi
                            </span>
                        </div>
                        <button 
                            onClick={handleAnalyze}
                            disabled={calculating || !fullName || !birthDate}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            {calculating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Hesaplanıyor...</span>
                                </>
                            ) : (
                                <>
                                    <Calculator className="w-5 h-5" />
                                    <span>Analizi Başlat</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        ) : (
            
            /* SENARYO 2: RAPOR VAR -> SONUÇLARI GÖSTER */
            <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* 1. KARTLAR (SAYILAR) */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* YAŞAM YOLU KARTI */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-[#020617] border border-emerald-500/20 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Hash className="w-32 h-32 -mr-8 -mt-8" /></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-3xl font-bold border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    {report.lifePath}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Yaşam Yolu</h3>
                                    <p className="text-xs text-emerald-400/80 uppercase tracking-wider font-bold">Senin Özün</p>
                                </div>
                            </div>
                            <h4 className="text-emerald-300 font-serif text-lg mb-3">{report.analysis?.life_path_title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed text-justify">{report.analysis?.life_path_desc}</p>
                        </div>
                    </div>

                    {/* KADER SAYISI KARTI */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-[#020617] border border-indigo-500/20 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Binary className="w-32 h-32 -mr-8 -mt-8" /></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-3xl font-bold border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                    {report.destiny}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Kader Sayısı</h3>
                                    <p className="text-xs text-indigo-400/80 uppercase tracking-wider font-bold">Senin Amacın</p>
                                </div>
                            </div>
                            <h4 className="text-indigo-300 font-serif text-lg mb-3">{report.analysis?.destiny_title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed text-justify">{report.analysis?.destiny_desc}</p>
                        </div>
                    </div>
                </div>

                {/* 2. SENTEZ RAPORU */}
                <div className="bg-[#0f172a] border border-white/5 p-8 md:p-10 rounded-[2rem] relative shadow-2xl">
                    <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-amber-400" /></div>
                        Ruhsal Sentez
                    </h3>
                    
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-8 text-justify text-base md:text-lg font-light">
                            {report.analysis?.synthesis}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 border-t border-white/5 pt-8 mt-8">
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Palette className="w-6 h-6" /></div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Şanslı Renkler</span>
                                <div className="flex flex-wrap gap-2">
                                    {report.analysis?.lucky_colors?.map((color: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-black/40 rounded-lg text-xs text-white border border-white/10">{color}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400"><Ghost className="w-6 h-6" /></div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Ruh Hayvanı</span>
                                <span className="text-white text-lg font-serif font-medium">{report.analysis?.spirit_animal}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center opacity-40 pt-4">
                    <p className="text-[10px] text-gray-500">Analiz kimliği: {report.id || "Yeni"} • {new Date().toLocaleDateString()} tarihinde oluşturuldu.</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}