"use client";

import Link from "next/link";
import { Moon, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#020617] border-t border-white/5 pt-16 pb-8 px-6 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo ve Motto */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 group">
              <div className="p-2 bg-white/5 rounded-full group-hover:bg-[#fbbf24]/10 transition-colors">
                <Moon className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]/20 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="font-serif text-xl tracking-wider text-white">RÜYA YORUMCUM AI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Bilinçaltının gizemli kapılarını yapay zeka ile aralıyoruz. Modern teknoloji ve kadim bilgelik bir arada.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#fbbf24] rounded-full"></span> Keşfet
            </h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href="/dashboard/pricing" className="hover:text-[#fbbf24] transition-colors hover:translate-x-1 inline-block duration-200">Paketler & Fiyatlar</Link></li>
              <li><Link href="/dashboard/ay-takvimi" className="hover:text-[#fbbf24] transition-colors hover:translate-x-1 inline-block duration-200">Ay Takvimi</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span> Kurumsal
            </h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href="/yasal/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/yasal/iptal-ve-iade-kosullari" className="hover:text-white transition-colors">İptal ve İade Koşulları</Link></li>
              <li><Link href="/yasal/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/yasal/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span> İletişim
            </h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Mail className="w-4 h-4 text-gray-300" />
                </div>
                <span className="group-hover:text-white transition-colors">fikriemretopcu07s@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Bilgi ve Ödeme Logoları */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-xs text-center md:text-left">
            © {currentYear} Fikri Emre Topçu - Rüya Yorumcum AI. Tüm Hakları Saklıdır.
          </p>
          
          {/* Ödeme Logoları (PayTR Kaldırıldı) */}
          <div className="flex items-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold tracking-widest border border-green-500/20 px-2 py-1 rounded bg-green-500/5">
               SSL SECURE
            </div>
            {/* PayTR Logo ve ayırıcı çizgi kaldırıldı */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}