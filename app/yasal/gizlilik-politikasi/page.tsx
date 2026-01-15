export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-serif text-[#fbbf24] mb-8 text-center">GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ</h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <p><strong>Fikri Emre Topçu (Rüya Yorumcum AI)</strong> olarak ("Veri Sorumlusu"), kişisel verilerinizin güvenliğine önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında hazırlanmıştır.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. TOPLANAN VERİLER</h2>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi (Google girişi veya formlar aracılığıyla).</li>
              <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, giriş çıkış log kayıtları (Yasal zorunluluk).</li>
              <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, rüya metinleri (Anonimleştirilerek analiz için işlenir).</li>
            </ul>
            <p className="mt-2 text-yellow-500/80 text-sm border border-yellow-500/20 p-2 rounded">* Önemli: Kredi kartı bilgileriniz sistemimizde SAKLANMAZ. Ödeme işlemleri lisanslı ödeme kuruluşu PayTR aracılığıyla şifreli ve güvenli bir şekilde gerçekleştirilir.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. VERİLERİN KULLANIM AMACI</h2>
            <p>Toplanan kişisel verileriniz;</p>
            <ul className="list-disc list-inside ml-4">
              <li>Hizmetin ifa edilmesi ve rüya analizinin yapay zeka ile oluşturulması,</li>
              <li>Üyelik işlemlerinin yönetilmesi,</li>
              <li>Ödeme işlemlerinin doğrulanması ve faturalandırma,</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (Log tutma vb.) amacıyla işlenmektedir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. ÜÇÜNCÜ TARAFLARLA PAYLAŞIM</h2>
            <p>Verileriniz, yalnızca hizmetin sağlanması için gerekli olduğu ölçüde aşağıdaki taraflarla paylaşılabilir:</p>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Ödeme Altyapısı:</strong> PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. (Ödeme onayı için).</li>
              <li><strong>Yasal Kurumlar:</strong> Talep edilmesi halinde yetkili kamu kurum ve kuruluşları (Emniyet, Savcılık vb.).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. VERİ SAHİBİNİN HAKLARI</h2>
            <p>KVKK'nın 11. maddesi uyarınca <strong>fikriemretopcu07s@gmail.com</strong> adresine başvurarak kişisel verilerinizin işlenip işlenmediğini öğrenme, silinmesini veya düzeltilmesini talep etme hakkına sahipsiniz.</p>
          </section>
        </div>
      </div>
    </div>
  );
}