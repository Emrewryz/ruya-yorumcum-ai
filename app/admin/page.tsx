"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  LayoutDashboard, Users, History, AlertCircle, Search, 
  Plus, Minus, RefreshCw, ShieldCheck, Coins, CheckCircle
} from "lucide-react";
import { 
  getAdminStats, getUsersList, getRecentTransactions, 
  adminManageCredits, getPendingOrders, resolvePendingOrder 
} from "@/app/actions/admin"; // Az önce oluşturduğumuz dosya

export default function AdminDashboard() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'issues'>('overview');
  const [loading, setLoading] = useState(false);

  // Veriler
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  
  // Arama ve İşlem
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditReason, setCreditReason] = useState("Bonus");

  const ADMIN_EMAILS = ["fikriemretopcu07@gmail.com"]; // Admin listesi

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && ADMIN_EMAILS.includes(user.email!)) {
      setIsAdmin(true);
      loadAllData();
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const s = await getAdminStats();
      const u = await getUsersList();
      const t = await getRecentTransactions();
      const p = await getPendingOrders();
      
      setStats(s);
      setUsers(u);
      setTransactions(t);
      setPendingOrders(p);
    } catch (e) {
      toast.error("Veriler çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    const u = await getUsersList(term);
    setUsers(u);
  };

  const handleCreditOperation = async () => {
    if (!selectedUser || creditAmount === 0) return;
    
    try {
      await adminManageCredits(selectedUser.id, creditAmount, creditReason);
      toast.success(`${selectedUser.email} kullanıcısına ${creditAmount} kredi işlendi.`);
      setSelectedUser(null);
      setCreditAmount(0);
      loadAllData(); // Verileri yenile
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleResolveOrder = async (id: string) => {
    await resolvePendingOrder(id);
    loadAllData();
    toast.success("Kayıt arşivlendi.");
  };

  if (!isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">ERİŞİM REDDEDİLDİ 403</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      
      {/* HEADER */}
      <header className="bg-[#0f172a] border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
           </div>
           <div>
              <h1 className="font-bold text-xl">Admin Terminali</h1>
              <p className="text-xs text-gray-400">Sistem Durumu: <span className="text-green-400">Aktif</span></p>
           </div>
        </div>
        <button onClick={loadAllData} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
           <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-88px)]">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-[#0f172a]/50 border-r border-white/5 p-4 flex flex-col gap-2">
           <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              <LayoutDashboard className="w-4 h-4" /> Genel Bakış
           </button>
           <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              <Users className="w-4 h-4" /> Kullanıcı Yönetimi
           </button>
           <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              <History className="w-4 h-4" /> İşlem Geçmişi
           </button>
           <button onClick={() => setActiveTab('issues')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === 'issues' ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:bg-white/5'}`}>
              <AlertCircle className="w-4 h-4" /> Askıdaki İşlemler 
              {pendingOrders.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders.length}</span>}
           </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
           
           {/* TAB: OVERVIEW */}
           {activeTab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                    <div className="text-gray-400 text-sm mb-1">Toplam Kullanıcı</div>
                    <div className="text-3xl font-bold text-white">{stats.userCount}</div>
                 </div>
                 <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                    <div className="text-gray-400 text-sm mb-1">Dağıtılan Kredi</div>
                    <div className="text-3xl font-bold text-green-400">+{stats.totalCreditsInCirculation}</div>
                 </div>
                 <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                    <div className="text-gray-400 text-sm mb-1">Harcanan Kredi</div>
                    <div className="text-3xl font-bold text-indigo-400">-{stats.totalCreditsSpent}</div>
                 </div>
              </div>
           )}

           {/* TAB: USERS */}
           {activeTab === 'users' && (
              <div className="space-y-6">
                 {/* Arama */}
                 <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="E-posta veya isim ara..." 
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500"
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                 </div>

                 {/* Kullanıcı Tablosu */}
                 <div className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                          <tr>
                             <th className="p-4">Kullanıcı</th>
                             <th className="p-4">Bakiye</th>
                             <th className="p-4">Üyelik</th>
                             <th className="p-4 text-right">İşlem</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                          {users.map(u => (
                             <tr key={u.id} className="hover:bg-white/5 transition">
                                <td className="p-4">
                                   <div className="font-bold text-white">{u.full_name || 'İsimsiz'}</div>
                                   <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="p-4 font-mono text-yellow-400 font-bold">{u.credits}</td>
                                <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{u.subscription_tier}</span></td>
                                <td className="p-4 text-right">
                                   <button 
                                     onClick={() => setSelectedUser(u)}
                                     className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                                   >
                                      Yönet
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {/* TAB: TRANSACTIONS */}
           {activeTab === 'transactions' && (
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                       <tr>
                          <th className="p-4">Kullanıcı</th>
                          <th className="p-4">İşlem</th>
                          <th className="p-4">Miktar</th>
                          <th className="p-4">Tarih</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                       {transactions.map(t => (
                          <tr key={t.id} className="hover:bg-white/5 transition">
                             <td className="p-4 text-xs text-gray-400">{t.profiles?.email}</td>
                             <td className="p-4">
                                <div className="text-white font-medium">{t.description}</div>
                                <div className="text-xs text-gray-500 capitalize">{t.process_type}</div>
                             </td>
                             <td className={`p-4 font-bold font-mono ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {t.amount > 0 ? '+' : ''}{t.amount}
                             </td>
                             <td className="p-4 text-xs text-gray-500">
                                {new Date(t.created_at).toLocaleString('tr-TR')}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}

           {/* TAB: ISSUES (Webhook Logs) */}
           {activeTab === 'issues' && (
              <div className="space-y-4">
                 {pendingOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Hiç sorunlu işlem yok! 🎉</div>
                 ) : (
                    pendingOrders.map(order => (
                       <div key={order.id} className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between">
                          <div>
                             <h3 className="font-bold text-red-200">{order.shopier_email}</h3>
                             <p className="text-xs text-red-300/60 mt-1">Sipariş: {order.shopier_order_id} • Tutar: {order.amount} TL</p>
                             <p className="text-xs text-red-400 font-mono mt-2 bg-black/20 p-1 rounded">{order.error_message}</p>
                          </div>
                          <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                   setSelectedUser({ id: 'MANUEL', email: order.shopier_email }); // Manuel e-posta ile arama yapman gerekebilir
                                   // Not: Burada e-posta kopyalayıp User tabına gitmek en mantıklısı
                                   navigator.clipboard.writeText(order.shopier_email);
                                   toast.info("E-posta kopyalandı, Kullanıcı Yönetimi'nden aratıp kredi yükleyin.");
                                   setActiveTab('users');
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold"
                             >
                                Kullanıcıya Git
                             </button>
                             <button 
                                onClick={() => handleResolveOrder(order.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white"
                             >
                                Çözüldü
                             </button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           )}

        </main>
      </div>

      {/* --- KREDİ YÖNETİM MODALI --- */}
      {selectedUser && (
         <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1e293b] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
               <h3 className="text-xl font-bold text-white mb-1">Kredi Yönetimi</h3>
               <p className="text-sm text-gray-400 mb-6">{selectedUser.email}</p>

               <div className="space-y-4">
                  <div>
                     <label className="text-xs text-gray-500 mb-1 block">Miktar (+ Ekle, - Çıkar)</label>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setCreditAmount(prev => prev - 1)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><Minus className="w-4 h-4"/></button>
                        <input 
                           type="number" 
                           value={creditAmount} 
                           onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                           className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-center font-bold text-xl focus:border-indigo-500 outline-none"
                        />
                        <button onClick={() => setCreditAmount(prev => prev + 1)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><Plus className="w-4 h-4"/></button>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs text-gray-500 mb-1 block">İşlem Nedeni</label>
                     <select 
                        value={creditReason} 
                        onChange={(e) => setCreditReason(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none"
                     >
                        <option value="Bonus">Bonus / Hediye</option>
                        <option value="Shopier Telafi">Shopier Telafi (Manuel)</option>
                        <option value="İade">Hata Telafisi / İade</option>
                        <option value="Correction">Hatalı Bakiye Düzeltme</option>
                     </select>
                  </div>

                  <div className="flex gap-3 mt-6">
                     <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold">İptal</button>
                     <button 
                        onClick={handleCreditOperation}
                        disabled={creditAmount === 0}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50"
                     >
                        Onayla
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}