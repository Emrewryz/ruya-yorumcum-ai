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
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 text-sm animate-pulse tracking-widest uppercase">Kozmik Kayıtlar Taranıyor...</p>
        </div>
    );
  }

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative ve layout.tsx'e tam oturan yapı)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-emerald-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>
      
      {/* HEADER VE GERİ DÖN BUTONU */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md mb-8 transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Numeroloji Merkezi</span>
        </button>

        <div className="text-center md:text-left w-full max-w-4xl mb-4">
           <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">
               {report ? "Ruhsal Kimliğiniz" : "Kişisel Numeroloji"}
           </h1>
           <p className="text-slate-400 text-sm md:text-base font-light">
               {report 
                   ? <span className="text-emerald-400 font-medium">{report.fullName}</span> 
                   : "Doğum tarihiniz ve isminizle kaderinizin şifrelerini çözün."}
               {report && ", işte doğumunla gelen şifrelerin."}
           </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 flex flex-col">
         <AnimatePresence mode="wait">
          
          {/* SENARYO 1: RAPOR YOK -> FORM GÖSTER */}
          {!report ? (
              <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-xl mx-auto w-full mt-4 md:mt-8"
              >
                  <div className="bg-[#131722]/80 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden transform-gpu">
                      
                      {/* Dekoratif Arkaplan Glow */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                      <div className="space-y-8 relative z-10">
                          {/* İsim Input */}
                          <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kimlikteki Tam Adınız</label>
                              <div className="relative group">
                                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                  <input 
                                      type="text" 
                                      value={fullName}
                                      onChange={(e) => setFullName(e.target.value)}
                                      placeholder="Örn: Mustafa Kemal Atatürk"
                                      className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
                                  />
                              </div>
                          </div>

                          {/* Tarih Input */}
                          <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Doğum Tarihiniz</label>
                              <div className="relative group">
                                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                  <input 
                                      type="date" 
                                      value={birthDate}
                                      onChange={(e) => setBirthDate(e.target.value)}
                                      className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none min-h-[56px] shadow-inner"
                                  />
                              </div>
                          </div>

                          {/* Aksiyon Alanı */}
                          <div className="pt-4 border-t border-white/5 mt-8">
                              <div className="flex justify-between items-center text-xs text-slate-500 mb-5 px-1">
                                  <span className="uppercase tracking-widest font-bold">Analiz Maliyeti</span>
                                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                      <Crown className="w-3.5 h-3.5"/> 2 Kredi
                                  </span>
                              </div>
                              <button 
                                  onClick={handleAnalyze}
                                  disabled={calculating || !fullName || !birthDate}
                                  className="w-full py-4 md:py-5 rounded-2xl bg-emerald-500 text-[#0a0c10] font-bold uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
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
              
              /* SENARYO 2: RAPOR VAR -> SONUÇLARI GÖSTER */
              <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 md:space-y-8 w-full mt-2"
              >
                  {/* 1. KARTLAR (SAYILAR) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* YAŞAM YOLU KARTI */}
                      <div className="bg-[#131722]/80 backdrop-blur-xl border border-emerald-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/40 transition-colors shadow-xl">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Hash className="w-32 h-32 -mr-8 -mt-8 text-emerald-400" /></div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-5 mb-8">
                                  <div className="w-20 h-20 rounded-2xl bg-[#0a0c10] flex items-center justify-center text-emerald-400 font-mono text-4xl font-bold border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
                                      {report.lifePath}
                                  </div>
                                  <div>
                                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Yaşam Yolu</h3>
                                      <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Senin Özün</p>
                                  </div>
                              </div>
                              <h4 className="text-emerald-300 font-serif text-xl mb-3">{report.analysis?.life_path_title}</h4>
                              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed text-justify mb-2">{report.analysis?.life_path_desc}</p>
                          </div>
                      </div>

                      {/* KADER SAYISI KARTI */}
                      <div className="bg-[#131722]/80 backdrop-blur-xl border border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-xl">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Binary className="w-32 h-32 -mr-8 -mt-8 text-indigo-400" /></div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-5 mb-8">
                                  <div className="w-20 h-20 rounded-2xl bg-[#0a0c10] flex items-center justify-center text-indigo-400 font-mono text-4xl font-bold border border-indigo-500/30 shadow-inner group-hover:scale-105 transition-transform">
                                      {report.destiny}
                                  </div>
                                  <div>
                                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Kader Sayısı</h3>
                                      <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold">Senin Amacın</p>
                                  </div>
                              </div>
                              <h4 className="text-indigo-300 font-serif text-xl mb-3">{report.analysis?.destiny_title}</h4>
                              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed text-justify mb-2">{report.analysis?.destiny_desc}</p>
                          </div>
                      </div>
                  </div>

                  {/* 2. SENTEZ RAPORU */}
                  <div className="bg-[#131722]/90 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative shadow-2xl overflow-hidden transform-gpu">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                      <h3 className="text-2xl md:text-3xl font-serif text-white mb-6 flex items-center gap-4 relative z-10">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                              <Sparkles className="w-6 h-6 text-amber-400" />
                          </div>
                          Ruhsal Sentez
                      </h3>
                      
                      <div className="relative z-10">
                          <p className="text-slate-300 leading-[1.8] text-justify text-base md:text-lg font-light">
                              {report.analysis?.synthesis}
                          </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 border-t border-white/5 pt-8 mt-8 relative z-10">
                          <div className="flex items-start gap-4 p-5 bg-[#0a0c10] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 shadow-inner"><Palette className="w-6 h-6" /></div>
                              <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Şanslı Renkler</span>
                                  <div className="flex flex-wrap gap-2">
                                      {report.analysis?.lucky_colors?.map((color: string, i: number) => (
                                          <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-xs text-white border border-white/10">{color}</span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-start gap-4 p-5 bg-[#0a0c10] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-inner"><Ghost className="w-6 h-6" /></div>
                              <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ruh Hayvanı</span>
                                  <span className="text-white text-lg font-serif font-medium block">{report.analysis?.spirit_animal}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="text-center opacity-40 pt-4 pb-10">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
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