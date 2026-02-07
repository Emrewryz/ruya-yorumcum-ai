import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      
      {/* SİDEBAR (Genişliği w-20 = 80px) */}
      <Sidebar />

      {/* İÇERİK ALANI */}
      {/* md:pl-20 yapıyoruz ki tam sidebar kadar boşluk bıraksın (eskisi pl-64 idi) */}
      <main className="flex-1 md:pl-20 relative w-full">
        {children}
      </main>

    </div>
  );
}