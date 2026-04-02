import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* TARAYICI HAFIZASINI OKUYAN KÜÇÜK SİHİRLİ SCRIPT */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            } catch (_) {}
          `,
        }}
      />
      
      <div className="flex h-screen bg-[#faf9f6] dark:bg-[#0a0c10] text-stone-800 dark:text-stone-200 antialiased transition-colors duration-500">
        
        {/* 1. MASAÜSTÜ SOL NAVBAR */}
        <Sidebar />

        {/* 2. ANA İÇERİK ALANI */}
        <main className="flex-1 ml-0 md:ml-20 relative w-full md:w-[calc(100%-5rem)] h-screen overflow-y-auto overflow-x-hidden pb-24 md:pb-0">
          <div className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>

      </div>
    </>
  );
}