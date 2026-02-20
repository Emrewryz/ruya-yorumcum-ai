import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-amber-500/30 overflow-hidden">
      
      {/* 1. AKILLI SOL NAVBAR (Dar halde 80px, üzerine gelince 256px olur) */}
      <Sidebar />

      {/* 2. ANA İÇERİK ALANI 
          Menü dar olduğu için sadece ml-20 (80px) boşluk bırakıyoruz.
          Menü açıldığında içeriği itmek yerine üstüne şık bir gölgeyle açılır. 
      */}
      <main className="flex-1 ml-20 relative w-[calc(100%-5rem)] h-screen overflow-y-auto overflow-x-hidden">
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}