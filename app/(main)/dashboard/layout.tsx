import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-amber-500/30 overflow-hidden transition-colors duration-300">
      
      {/* 1. MASAÜSTÜ SOL NAVBAR (Sadece md ve üzeri ekranlarda görünür) */}
      <Sidebar />

      {/* 2. ANA İÇERİK ALANI 
          Mobilde: ml-0 (tam genişlik) ve pb-24 (alt menü boşluğu)
          Masaüstünde: md:ml-20 (sol menü boşluğu)
      */}
      <main className="flex-1 ml-0 md:ml-20 relative w-full md:w-[calc(100%-5rem)] h-screen overflow-y-auto overflow-x-hidden pb-24 md:pb-0">
        <div className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}