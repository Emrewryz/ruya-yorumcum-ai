"use client";

import Link from "next/link";
import { Moon, Mail, Instagram, MapPin, Phone } from "lucide-react";

// TikTok İkonu (Custom SVG)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#020617] text-slate-400 relative overflow-hidden font-sans border-t border-white/5">
      
      {/* Arkaplan Işığı (Sadece hafif bir ambiyans) */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fbbf24]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
           
           {/* --- 1. SOL BLOK (MARKA & LOGO) --- */}
           <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl border border-[#fbbf24]/30 flex items-center justify-center bg-[#fbbf24]/5">
                    <Moon className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]/20 -rotate-12" strokeWidth={1.5} />
                 </div>
                 <span className="font-serif text-3xl text-white font-bold tracking-wide">RüyaYorumcum</span>
              </div>

              <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                 Türkiye'nin en kapsamlı spiritüel yapay zeka platformu. 
                 Geleneksel bilgeliği modern teknolojiyle birleştirerek bilinçaltınızın şifrelerini çözüyoruz.
              </p>
              
              <div className="flex gap-4 pt-2">
                 <SocialLink href="https://instagram.com/ruyayorumcum_ai" icon={<Instagram className="w-5 h-5"/>} label="Instagram" />
                 <SocialLink href="https://tiktok.com/@ruya.yorumcum.ai" icon={<TikTokIcon className="w-5 h-5"/>} label="TikTok" />
                 <SocialLink href="mailto:iletisim@ruyayorumcum.com" icon={<Mail className="w-5 h-5"/>} label="Email" />
              </div>
           </div>

           {/* --- 2. HİZMETLER --- */}
           <div className="lg:col-span-3">
              <h4 className="text-white font-serif font-bold text-lg mb-6">Hizmetler</h4>
              <ul className="space-y-3 text-sm">
                 <FooterLink href="/ruya-tabiri">Rüya Analizi</FooterLink>
                 <FooterLink href="/astroloji">Doğum Haritası</FooterLink>
                 <FooterLink href="/ruya-gorsellestirme">Rüya Görselleştirme</FooterLink>
                 <FooterLink href="/tarot">Tarot Falı</FooterLink>
                 <FooterLink href="/numeroloji">Numeroloji</FooterLink>
                 <FooterLink href="/duygu-analizi">Duygu Analizi</FooterLink>
              </ul>
           </div>

           {/* --- 3. POPÜLER SÖZLÜK --- */}
           <div className="lg:col-span-2">
              <h4 className="text-white font-serif font-bold text-lg mb-6">Sözlük</h4>
              <ul className="space-y-3 text-sm">
                 <FooterLink href="/sozluk/ruyada-yilan-gormek">Rüyada Yılan</FooterLink>
                 <FooterLink href="/sozluk/ruyada-altin-gormek">Rüyada Altın</FooterLink>
                 <FooterLink href="/sozluk/ruyada-dis-dokulmesi">Rüyada Diş</FooterLink>
                 <FooterLink href="/sozluk/ruyada-ucmak">Rüyada Uçmak</FooterLink>
                 <FooterLink href="/sozluk/ruyada-aglamak">Rüyada Ağlamak</FooterLink>
              </ul>
           </div>

           {/* --- 4. KURUMSAL & YASAL (GÜNCELLENDİ) --- */}
           <div className="lg:col-span-2">
              <h4 className="text-white font-serif font-bold text-lg mb-6">Kurumsal</h4>
              <ul className="space-y-3 text-sm">
                 <FooterLink href="/blog">Blog</FooterLink>
                 <FooterLink href="/iletisim">İletişim</FooterLink>
                 <FooterLink href="/yasal/kullanim-kosullari">Kullanım Şartları</FooterLink>
                 <FooterLink href="/yasal/gizlilik-politikasi">Gizlilik Politikası</FooterLink>
                 <FooterLink href="/yasal/mesafeli-satis-sozlesmesi">Satış Sözleşmesi</FooterLink>
                 {/* EKLENEN KISIM: İptal ve İade */}
                 <FooterLink href="/yasal/iptal-ve-iade-kosullari">İptal ve İade</FooterLink>
              </ul>
           </div>

        </div>

        {/* --- ALT KISIM --- */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs text-slate-600 text-center md:text-left">
              © {currentYear} Rüya Yorumcum AI. Tüm Hakları Saklıdır.
           </p>
           
           <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 cursor-default">
                 <LockIcon className="w-3 h-3 text-green-500" />
                 <span className="text-[10px] font-bold text-slate-300 tracking-widest">SSL SECURE</span>
              </div>
              <div className="flex gap-2">
                 <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                 <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white">MASTER</div>
              </div>
           </div>
        </div>

      </div>
    </footer>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
   return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label={label}
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#fbbf24] hover:text-[#020617] border border-white/10 hover:border-[#fbbf24] flex items-center justify-center transition-all duration-300 group"
      >
         {icon}
      </a>
   )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
   return (
      <li>
         <Link href={href} className="text-slate-400 hover:text-[#fbbf24] transition-colors flex items-center gap-2 group">
            <span className="w-1 h-1 rounded-full bg-[#fbbf24] opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {children}
         </Link>
      </li>
   )
}

function LockIcon({ className }: { className?: string }) {
   return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
         <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
         <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
   )
}