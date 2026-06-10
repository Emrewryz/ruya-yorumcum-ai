import type { Metadata } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Rüya Yorumcum",
  description: "Rüya Yorumcum gizlilik politikası ve kişisel veri işleme prensipleri. KVKK kapsamında haklarınız.",
  alternates: {
    canonical: `${SITE_URL}/gizlilik`,
  },
  robots: { index: true, follow: true },
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="prose prose-zinc prose-sm max-w-none">
        <h1>Gizlilik Politikası</h1>
        <p className="lead">Son güncelleme: Haziran 2026</p>

        <p>
          Rüya Yorumcum platformu ve veri sorumlusu Fikri Emre Topcu olarak kişisel verilerinizin korunmasını
          ciddiye alıyor, 6698 sayılı KVKK ve yürürlükteki mevzuata uygun hareket ediyoruz.
        </p>

        <h2>1. Toplanan Veriler</h2>
        <ul>
          <li><strong>Hesap verileri:</strong> Ad-soyad, e-posta, şifre (şifreli).</li>
          <li><strong>Kullanım verileri:</strong> Rüya metinleri, analiz sonuçları, sohbet geçmişi.</li>
          <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, oturum bilgileri.</li>
          <li><strong>Ödeme verileri:</strong> Sipariş numarası (kart bilgileri tarafımızda saklanmaz).</li>
          <li><strong>Çerezler:</strong> Oturum ve tercih yönetimi için.</li>
        </ul>

        <h2>2. Verilerin Kullanım Amacı</h2>
        <ul>
          <li>Hizmetin sunulması ve kişiselleştirilmesi.</li>
          <li>Yapay zeka analiz kalitesinin artırılması.</li>
          <li>Ödeme işlemlerinin güvenli gerçekleştirilmesi.</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
          <li>Güvenlik ve dolandırıcılık önleme.</li>
        </ul>

        <h2>3. Veri Paylaşımı</h2>
        <p>
          Kişisel verileriniz yasal zorunluluklar olmaksızın üçüncü taraflarla paylaşılmaz.
          Ödeme için BDDK lisanslı sağlayıcımıza yalnızca işlem tamamlama amacıyla minimum veri iletilir.
        </p>

        <h2>4. Veri Saklama</h2>
        <p>
          Verileriniz hesabınız aktif olduğu süre ve yasal saklama yükümlülükleri gözetilerek saklanır.
        </p>

        <h2>5. Haklarınız (KVKK Madde 11)</h2>
        <ul>
          <li>Verilerinizin işlenip işlenmediğini öğrenme.</li>
          <li>Yanlış verilerin düzeltilmesini isteme.</li>
          <li>Verilerin silinmesini talep etme.</li>
          <li>Otomatik kararlamalara itiraz etme.</li>
        </ul>
        <p>Talepler: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a></p>

        <h2>6. Güvenlik</h2>
        <p>Verileriniz TLS/HTTPS ile iletilir, modern bulut altyapısında şifreli saklanır. Şifreler düz metin olarak depolanmaz.</p>

        <h2>7. İletişim</h2>
        <p>
          Veri Sorumlusu: Fikri Emre Topcu<br />
          E-posta: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>
      </div>
    </div>
  );
}