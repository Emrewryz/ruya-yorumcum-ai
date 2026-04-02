"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Calendar, Calculator, Loader2, Sparkles, 
  Hash, Binary, Crown, Palette, Ghost, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { getPersonalNumerology, createNumerologyAnalysis } from "@/app/actions/get-numerology";

export default function GeneralNumerologyPage() {
  const router = useRouter();
  
  // --- STATE YÖNETİMİ ---
  const [loading, setLoading] = useState(true); 
  const [calculating, setCalculating] = useState(false); 
  const [report, setReport] = useState<any>(null); 
  
  // Form Verileri
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // 1. Sayfa Yüklenince: Veritabanını Kontrol Et
  useEffect(() => {
    const checkExistingData = async () => {
      try {
        const result = await getPersonalNumerology();
        
        if (result.success && result.data) {
          setReport(result.data);
        } else {
          if (typeof window !== 'undefined') {
             const pending = localStorage.getItem("pending_numerology_data");
             if (pending) {
                const { fullName: fn, birthDate: bd } = JSON.parse(pending);
                setFullName(fn || "");
                setBirthDate(bd || "");
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
        const result = await createNumerologyAnalysis({ fullName, birthDate });
        
        if (result.success) {
            setReport(result.data);
            toast.success("Numeroloji haritanız başarıyla oluşturuldu!");
        } else {
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

  if (loading) {
    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
            <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-500 animate-spin mb-4" />
            <p className="text-stone-500 dark:text-slate-500 text-sm animate-pulse tracking-widest uppercase font-bold transition-colors">Kozmik Kayıtlar Taranıyor...</p>
        </div>
    );
  }

  return (
    // Çift Temalı Ana Kapsayıcı
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-500/30 antialiased transition-colors duration-500">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/60 dark:from-emerald-900/10 via-transparent to-transparent pointer-events-none -z-10 transition-colors"></div>
      
      {/* HEADER VE GERİ DÖN BUTONU */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4 transition-colors">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors text-xs font-bold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white uppercase tracking-widest shadow-sm dark:shadow-none mb-8 md:mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Numeroloji Merkezi</span>
        </button>

        <div className="text-center md:text-left w-full max-w-4xl mb-4">
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">
               {report ? "Ruhsal Kimliğiniz" : "Kişisel Numeroloji"}
           </h1>
           <p className="text-stone-500 dark:text-slate-400 text-sm md:text-base font-light transition-colors">
               {report 
                   ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">{report.fullName}</span> 
                   : "Doğum tarihiniz ve isminizle kaderinizin şifrelerini çözün."}
               {report && ", işte doğumunla gelen şifrelerin."}
           </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 flex flex-col">
         <AnimatePresence mode="wait">
          
          {/* ================= SENARYO 1: RAPOR YOK -> FORM GÖSTER ================= */}
          {!report ? (
              <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-xl mx-auto w-full mt-4 md:mt-8"
              >
                  <div className="bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-stone-200 dark:border-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors">
                      
                      {/* Dekoratif Arkaplan Glow */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full blur-[60px] dark:blur-[80px] pointer-events-none transition-colors"></div>

                      <div className="space-y-6 md:space-y-8 relative z-10">
                          {/* İsim Input */}
                          <div className="space-y-2.5">
                              <label className="text-[10px] font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Kimlikteki Tam Adınız</label>
                              <div className="relative group">
                                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                                  <input 
                                      type="text" 
                                      value={fullName}
                                      onChange={(e) => setFullName(e.target.value)}
                                      placeholder="Örn: Mustafa Kemal Atatürk"
                                      className="w-full bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-5 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600 focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm dark:shadow-inner"
                                  />
                              </div>
                          </div>

                          {/* Tarih Input */}
                          <div className="space-y-2.5">
                              <label className="text-[10px] font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Doğum Tarihiniz</label>
                              <div className="relative group">
                                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-slate-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                                  <input 
                                      type="date" 
                                      value={birthDate}
                                      onChange={(e) => setBirthDate(e.target.value)}
                                      className="w-full bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-5 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-600 focus:border-emerald-400 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all appearance-none min-h-[56px] shadow-sm dark:shadow-inner [color-scheme:light] dark:[color-scheme:dark]"
                                  />
                              </div>
                          </div>

                          {/* Aksiyon Alanı */}
                          <div className="pt-4 border-t border-stone-100 dark:border-white/5 mt-8 transition-colors">
                              <div className="flex justify-between items-center text-xs text-stone-500 dark:text-slate-500 mb-5 px-1 transition-colors">
                                  <span className="uppercase tracking-widest font-bold">Analiz Maliyeti</span>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 transition-colors">
                                      <Crown className="w-3.5 h-3.5"/> 2 Kredi
                                  </span>
                              </div>
                              <button 
                                  onClick={handleAnalyze}
                                  disabled={calculating || !fullName || !birthDate}
                                  className="w-full py-4 md:py-5 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#0a0c10] font-bold uppercase tracking-widest hover:bg-emerald-700 dark:hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md dark:shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                              >
                                  {calculating ? (
                                      <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          <span>Sayılar Okunuyor...</span>
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
                  </div>
              </motion.div>
          ) : (
              
              /* ================= SENARYO 2: RAPOR VAR -> SONUÇLARI GÖSTER ================= */
              <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 md:space-y-8 w-full mt-2"
              >
                  {/* 1. KARTLAR (SAYILAR) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* YAŞAM YOLU KARTI */}
                      <div className="bg-emerald-50/50 dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-emerald-100 dark:border-emerald-500/20 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors shadow-sm dark:shadow-xl">
                          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-5 group-hover:opacity-10 transition-opacity"><Hash className="w-32 h-32 -mr-8 -mt-8 text-emerald-600 dark:text-emerald-400" /></div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-4 md:gap-5 mb-8">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-[#0a0c10] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono text-3xl md:text-4xl font-bold border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-inner group-hover:scale-105 transition-transform">
                                      {report.lifePath}
                                  </div>
                                  <div>
                                      <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-1 transition-colors">Yaşam Yolu</h3>
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-bold transition-colors">Senin Özün</p>
                                  </div>
                              </div>
                              <h4 className="text-emerald-700 dark:text-emerald-300 font-serif font-bold text-xl mb-3 transition-colors">{report.analysis?.life_path_title}</h4>
                              <p className="text-stone-600 dark:text-slate-300 text-sm md:text-base font-light leading-relaxed text-justify mb-2 transition-colors">{report.analysis?.life_path_desc}</p>
                          </div>
                      </div>

                      {/* KADER SAYISI KARTI */}
                      <div className="bg-indigo-50/50 dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-indigo-100 dark:border-indigo-500/20 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors shadow-sm dark:shadow-xl">
                          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-5 group-hover:opacity-10 transition-opacity"><Binary className="w-32 h-32 -mr-8 -mt-8 text-indigo-600 dark:text-indigo-400" /></div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-4 md:gap-5 mb-8">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-[#0a0c10] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono text-3xl md:text-4xl font-bold border border-indigo-200 dark:border-indigo-500/30 shadow-sm dark:shadow-inner group-hover:scale-105 transition-transform">
                                      {report.destiny}
                                  </div>
                                  <div>
                                      <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-1 transition-colors">Kader Sayısı</h3>
                                      <p className="text-[10px] text-indigo-600 dark:text-indigo-500 uppercase tracking-widest font-bold transition-colors">Senin Amacın</p>
                                  </div>
                              </div>
                              <h4 className="text-indigo-700 dark:text-indigo-300 font-serif font-bold text-xl mb-3 transition-colors">{report.analysis?.destiny_title}</h4>
                              <p className="text-stone-600 dark:text-slate-300 text-sm md:text-base font-light leading-relaxed text-justify mb-2 transition-colors">{report.analysis?.destiny_desc}</p>
                          </div>
                      </div>
                  </div>

                  {/* 2. SENTEZ RAPORU */}
                  <div className="bg-white dark:bg-[#131722]/90 dark:backdrop-blur-2xl border border-stone-200 dark:border-white/5 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] relative shadow-lg dark:shadow-2xl overflow-hidden transition-colors">
                      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-amber-100/50 dark:bg-amber-500/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none transition-colors"></div>

                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-4 relative z-10 transition-colors">
                          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 transition-colors">
                              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-500 dark:text-amber-400" />
                          </div>
                          Ruhsal Sentez
                      </h3>
                      
                      <div className="relative z-10">
                          <p className="text-stone-700 dark:text-slate-300 leading-[1.8] text-justify text-sm md:text-lg font-light transition-colors">
                              {report.analysis?.synthesis}
                          </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 md:gap-6 border-t border-stone-100 dark:border-white/5 pt-6 md:pt-8 mt-8 relative z-10 transition-colors">
                          
                          {/* Şanslı Renkler */}
                          <div className="flex items-start gap-4 p-5 bg-stone-50 dark:bg-[#0a0c10] rounded-2xl border border-stone-100 dark:border-white/5 hover:border-stone-200 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                              <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm dark:shadow-inner transition-colors"><Palette className="w-5 h-5 md:w-6 md:h-6" /></div>
                              <div>
                                  <span className="text-[10px] font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest block mb-2 transition-colors">Şanslı Renkler</span>
                                  <div className="flex flex-wrap gap-2">
                                      {report.analysis?.lucky_colors?.map((color: string, i: number) => (
                                          <span key={i} className="px-3 py-1 bg-white dark:bg-white/5 rounded-lg text-xs font-bold text-stone-700 dark:text-white border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">{color}</span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          
                          {/* Ruh Hayvanı */}
                          <div className="flex items-start gap-4 p-5 bg-stone-50 dark:bg-[#0a0c10] rounded-2xl border border-stone-100 dark:border-white/5 hover:border-stone-200 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                              <div className="p-3 bg-cyan-100 dark:bg-cyan-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-sm dark:shadow-inner transition-colors"><Ghost className="w-5 h-5 md:w-6 md:h-6" /></div>
                              <div>
                                  <span className="text-[10px] font-bold text-stone-500 dark:text-slate-500 uppercase tracking-widest block mb-2 transition-colors">Ruh Hayvanı</span>
                                  <span className="text-stone-900 dark:text-white text-base md:text-lg font-serif font-bold block transition-colors">{report.analysis?.spirit_animal}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="text-center opacity-60 dark:opacity-40 pt-4 pb-10 transition-opacity">
                      <p className="text-[10px] text-stone-400 dark:text-slate-400 uppercase tracking-widest font-mono font-bold transition-colors">
                          Analiz ID: {report.id?.slice(0,8) || "YENI"} • {new Date().toLocaleDateString('tr-TR')}
                      </p>
                  </div>
              </motion.div>
          )}
         </AnimatePresence>
      </main>
    </div>
  );
}