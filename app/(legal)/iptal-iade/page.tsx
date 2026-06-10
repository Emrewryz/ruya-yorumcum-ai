import type { Metadata } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export const metadata: Metadata = {
  title: "İptal ve İade Koşulları — Rüya Yorumcum",
  description: "Rüya Yorumcum dijital kredi paketleri için iptal, iade ve cayma hakkı koşulları.",
  alternates: {
    canonical: `${SITE_URL}/iptal-iade`,
  },
  robots: { index: true, follow: true },
};

export default function IptalIadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="prose prose-zinc prose-sm max-w-none">
        <h1>İptal ve İade Koşulları</h1>
        <p className="lead">Son güncelleme: Haziran 2026</p>

        <h2>1. Genel İlke</h2>
        <p>
          Rüya Yorumcum platformu (Fikri Emre Topcu) üzerinden satın alınan kredi paketleri
          anında ifa edilen dijital hizmet niteliğindedir. Satın alma tamamlanır tamamlanmaz
          krediler hesaba tanımlanır.
        </p>

        <h2>2. İade Koşulları ve Cayma Hakkı İstisnası</h2>

        <h3>2a. İade Yapılmayan Durumlar</h3>
        <ul>
          <li>
            6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ğ maddesi uyarınca
            elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı kullanılamaz.
          </li>
          <li>Kısmen veya tamamen kullanılmış krediler iade edilmez.</li>
        </ul>

        <h3>2b. İade Yapılabilecek Durumlar</h3>
        <ul>
          <li>Satın alım sonrası hiç kredi kullanılmamış ve 14 gün içinde talep iletilmişse iade değerlendirilebilir.</li>
          <li>Teknik hata nedeniyle kredi yüklenmemişse tam iade yapılır.</li>
          <li>Çift ödeme veya hatalı tahsilat durumunda fark iade edilir.</li>
        </ul>

        <h2>3. İptal ve İade Süreci</h2>
        <p>Taleplerinizi şu bilgilerle e-posta ile iletebilirsiniz:</p>
        <ul>
          <li>Kayıtlı e-posta adresiniz</li>
          <li>Sipariş veya referans numaranız</li>
          <li>Talep gerekçeniz</li>
        </ul>
        <p>İletişim: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a></p>
        <p>Talepler en geç 3 iş günü içinde yanıtlanır. Onaylanan iadeler 3–10 iş günü içinde kartınıza yansır.</p>

        <h2>4. Teknik Arızalarda Kredi Koruması</h2>
        <p>
          Yapay zeka analizi sırasında sistem hatası yaşanır ve tahlil üretilemezse,
          harcanan kredi otomatik olarak hesabınıza iade edilir.
        </p>

        <h2>5. İletişim</h2>
        <p>
          Yetkili: Fikri Emre Topcu<br />
          E-posta: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>
      </div>
    </div>
  );
}