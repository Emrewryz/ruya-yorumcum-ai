"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Zap, Crown, Loader2, RefreshCw, AlertCircle, CheckCircle, Search, Copy, ArrowRight } from "lucide-react";

// Tipler
interface PendingOrder {
  id: string;
  shopier_email: string;
  shopier_order_id: string;
  plan_type: string;
  amount: number;
  created_at: string;
}

export default function AdminPanel() {
  const supabase = createClient();
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite'>('pro');
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const ADMIN_EMAIL = "fikriemretopcu07@gmail.com";

  // Admin Kontrolü ve Veri Çekme
  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchPendingOrders();
    }
  };

  const fetchPendingOrders = async () => {
    setFetching(true);
    try {
        const res = await fetch('/api/admin/pending-orders');
        const data = await res.json();
        if(Array.isArray(data)) setPendingOrders(data);
    } catch (e) {
        console.error("Fetch hatası", e);
    } finally {
        setFetching(false);
    }
  };

  // 1. Manuel Paket Tanımlama Fonksiyonu
  const handleAssign = async () => {
    if(!targetEmail) return toast.error("Mail adresi giriniz");
    setLoading(true);

    try {
        const response = await fetch('/api/admin/assign-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, plan: selectedPlan }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'İşlem başarısız');

        toast.success(`BAŞARILI! ${targetEmail} -> ${selectedPlan.toUpperCase()}`);
        setTargetEmail(""); 
        
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setLoading(false);
    }
  };

  // 2. Askıdaki İşlemi Çözme (Logu kaldırır)
  const resolveLog = async (id: string) => {
    try {
        await fetch(`/api/admin/pending-orders?id=${id}`, { method: 'DELETE' });
        setPendingOrders(prev => prev.filter(order => order.id !== id));
        toast.info("Kayıt listeden kaldırıldı.");
    } catch (e) {
        toast.error("Silinemedi");
    }
  };

  // 3. Askıdaki İşlemden Otomatik Doldurma
  const fillFromPending = (order: PendingOrder) => {
    setTargetEmail(order.shopier_email); // Admin burayı elle düzeltebilir
    setSelectedPlan(order.plan_type as 'pro' | 'elite');
    toast.info("Bilgiler yukarıya taşındı. E-postayı düzeltip 'Paketi Tanımla'ya bas.");
  };

  if (!isAdmin) return <div className="p-20 text-center text-white">Yetkisiz Giriş</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 pt-24 max-w-6xl mx-auto">
       
       <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-[#fbbf24]">
                <ShieldCheck className="w-8 h-8" /> Operasyon Merkezi
            </h1>
            <div className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-400 font-mono">
                Admin: {ADMIN_EMAIL}
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SOL TARAF: MANUEL İŞLEM */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-fit">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="text-blue-400" /> Manuel Tanımlama
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                    Kullanıcının <b>sitedeki</b> e-posta adresini girerek paket tanımla.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 ml-1">Kullanıcı Email</label>
                        <input 
                            type="email" 
                            placeholder="ornek@gmail.com"
                            className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-white focus:border-[#fbbf24] outline-none transition"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setSelectedPlan('pro')}
                            className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition ${
                                selectedPlan === 'pro' 
                                ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <Zap className="w-5 h-5" /> KAŞİF
                        </button>
                        <button 
                            onClick={() => setSelectedPlan('elite')}
                            className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition ${
                                selectedPlan === 'elite' 
                                ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <Crown className="w-5 h-5" /> KAHİN
                        </button>
                    </div>

                    <button 
                        onClick={handleAssign}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        PAKETİ TANIMLA
                    </button>
                </div>
            </div>

            {/* SAĞ TARAF: ASKIDA KALANLAR */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertCircle className="text-red-400" /> Askıda Kalan Siparişler
                    </h2>
                    <button onClick={fetchPendingOrders} className="p-2 hover:bg-white/10 rounded-full transition">
                        <RefreshCw className={`w-4 h-4 text-gray-400 ${fetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {fetching ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : pendingOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 opacity-50">
                        <CheckCircle className="w-12 h-12 mb-2" />
                        <p>Tertemiz! Askıda işlem yok.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingOrders.map((order) => (
                            <div key={order.id} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex flex-col gap-2 group hover:bg-red-500/10 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            {order.shopier_email}
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(order.shopier_email)}
                                                className="text-gray-500 hover:text-white"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Sipariş No: <span className="font-mono">{order.shopier_order_id}</span> • {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded bg-white/10 ${
                                        order.plan_type === 'elite' ? 'text-amber-400' : 'text-blue-400'
                                    }`}>
                                        {order.plan_type?.toUpperCase()} ({order.amount} TL)
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => fillFromPending(order)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-xs py-2 rounded-lg border border-white/10 flex items-center justify-center gap-1 transition"
                                    >
                                        <ArrowRight className="w-3 h-3" /> İşleme Al
                                    </button>
                                    <button 
                                        onClick={() => resolveLog(order.id)}
                                        className="px-3 bg-white/5 hover:bg-red-900/30 text-xs py-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 transition"
                                    >
                                        Arşivle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
}