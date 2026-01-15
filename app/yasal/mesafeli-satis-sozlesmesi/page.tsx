export default function DistanceSalesAgreement() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-serif text-[#fbbf24] mb-8 text-center">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. TARAFLAR</h2>
            <p className="mb-2"><strong>SATICI (Hizmet Sağlayıcı):</strong></p>
            <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
              <li><strong>Ünvan:</strong> Fikri Emre Topçu (Rüya Yorumcum AI)</li>
              <li><strong>Adres:</strong> Ahatlı Mahallesi, 3170 Sokak, No: 18, Kat: 2, Daire: 5, Kepez / ANTALYA</li>
              <li><strong>E-posta:</strong> fikriemretopcu07s@gmail.com</li>
              <li><strong>Telefon:</strong> 0549 761 05 27</li>
            </ul>
            <p><strong>ALICI (Müşteri):</strong></p>
            <p className="ml-4">https://ruya-yorumcum-ai.vercel.app web sitesi üzerinden hizmet satın alan gerçek veya tüzel kişi.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. KONU</h2>
            <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini yaptığı, aşağıda nitelikleri ve satış fiyatı belirtilen dijital hizmetin (Rüya Yorumu ve Görselleştirme) satışı ve ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. HİZMETİN NİTELİĞİ VE TESLİMAT</h2>
            <p>Sözleşme konusu hizmet; yapay zeka destekli rüya tabiri, psikolojik analiz ve rüya görselleştirme hizmetidir. Hizmet, ödeme onayı alındıktan sonra elektronik ortamda (web sitesi paneli üzerinden) anında ifa edilir. Fiziksel bir kargo teslimatı yoktur.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. CAYMA HAKKI VE İSTİSNALARI</h2>
            <p className="text-red-400 font-medium">ÖNEMLİ UYARI:</p>
            <p>İşbu sözleşme konusu hizmet, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca <strong>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallar"</strong> kapsamındadır. Bu nedenle, hizmet ifa edildikten (analiz sonuçlandıktan) sonra ALICI'nın cayma ve iade hakkı bulunmamaktadır.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">5. GENEL HÜKÜMLER</h2>
            <p>5.1. ALICI, internet sitesinde sözleşme konusu hizmetin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
            <p>5.2. SATICI, teknik nedenlerden kaynaklanan fiyat güncellemeleri veya hizmet erişim hatalarından sorumlu tutulamaz, ancak hizmetin sistemsel hata nedeniyle hiç verilemediği durumlarda telafi veya iade yapmakla yükümlüdür.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">6. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
            <p>İşbu sözleşmeden doğacak uyuşmazlıklarda, her yıl Ticaret Bakanlığı tarafından ilan edilen değere kadar ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri, söz konusu değerin üzerindeki uyuşmazlıklarda ise Antalya Tüketici Mahkemeleri yetkilidir.</p>
          </section>
        </div>
      </div>
    </div>
  );
}