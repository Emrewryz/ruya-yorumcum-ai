export default function CancellationRefundPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-serif text-[#fbbf24] mb-8 text-center">İPTAL VE İADE KOŞULLARI</h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <p className="italic text-gray-400">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. GENEL İLKE</h2>
            <p>Rüya Yorumcum AI (Fikri Emre Topçu) tarafından sunulan hizmetler, tamamen dijital nitelikte olup, yapay zeka aracılığıyla kişiye özel üretilen içerikleri kapsar. Bu nedenle, satın alınan paket veya kredi kullanılarak analiz işlemi başlatıldığı andan itibaren hizmet "tüketilmiş" sayılır.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. CAYMA HAKKI İSTİSNASI</h2>
            <p>27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği'nin "Cayma Hakkının İstisnaları" başlıklı 15. maddesinin (ğ) bendi uyarınca; <strong>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler"</strong>de cayma hakkı kullanılamaz.</p>
            <p className="mt-2 text-red-400">Bu nedenle, ödemesi yapılan ve analizi tamamlanan rüya yorumları için ücret iadesi yapılmamaktadır.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. İADE YAPILABİLECEK DURUMLAR</h2>
            <p>Aşağıdaki teknik aksaklık hallerinde %100 ücret iadesi veya kredi yüklemesi yapılır:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Ödeme alınmasına rağmen sistemsel bir hata nedeniyle hesabınıza kredi/hak tanımlanmaması.</li>
              <li>Rüya analizinin teknik bir hata nedeniyle 24 saat içinde oluşturulamaması.</li>
              <li>Mükerrer (çift) ödeme alınması durumunda fazladan çekilen tutar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. İADE PROSEDÜRÜ</h2>
            <p>İade talepleriniz için <strong>info@ruyayorumcum.ai</strong> adresine sipariş numaranızla birlikte e-posta göndermeniz gerekmektedir. İade talebiniz incelendikten sonra haklı bulunması durumunda, ödemeyi yaptığınız karta 3-7 iş günü içerisinde iade işlemi PayTR aracılığıyla sağlanır.</p>
          </section>
        </div>
      </div>
    </div>
  );
}