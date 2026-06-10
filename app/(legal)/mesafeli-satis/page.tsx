import type { Metadata } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — Rüya Yorumcum",
  description: "Rüya Yorumcum dijital kredi satışına ilişkin mesafeli satış sözleşmesi.",
  alternates: {
    canonical: `${SITE_URL}/mesafeli-satis`,
  },
  robots: { index: true, follow: true },
};

export default function MesafeliSatisPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="prose prose-zinc prose-sm max-w-none">
        <h1>Mesafeli Satış Sözleşmesi</h1>
        <p className="lead">Son güncelleme: Haziran 2026</p>

        <h2>1. Taraflar</h2>
        <p>
          <strong>Satıcı (Hizmet Sağlayıcı):</strong><br />
          Adı/Unvanı: Fikri Emre Topcu<br />
          E-posta: fikriemretopcu07s@gmail.com<br />
          Web: ruyayorumcum.com.tr
        </p>
        <p>
          <strong>Alıcı (Tüketici):</strong><br />
          Platforma kayıt olan, giriş yapan veya misafir olarak dijital hizmeti satın alan kullanıcı.
        </p>

        <h2>2. Sözleşmenin Konusu</h2>
        <p>
          İşbu sözleşme; Alıcı'nın Satıcı'ya ait Rüya Yorumcum platformu üzerinden elektronik ortamda
          siparişini verdiği dijital kredi paketlerinin satışı ve ifasına ilişkin olarak 6502 sayılı
          Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince
          tarafların hak ve yükümlülüklerini düzenler.
        </p>

        <h2>3. Ürün ve Hizmet Bilgileri</h2>
        <p>Sözleşme konusu hizmet, yapay zeka destekli metin analizinde kullanılmak üzere hesaba tanımlanan dijital kredilerdir.</p>
        <table>
          <thead>
            <tr><th>Paket Adı</th><th>İçerik</th><th>Fiyat (KDV Dahil)</th></tr>
          </thead>
          <tbody>
            <tr><td>Başlangıç</td><td>10 Analiz Hakkı</td><td>39 TL</td></tr>
            <tr><td>Popüler</td><td>30 Analiz Hakkı</td><td>89 TL</td></tr>
            <tr><td>Bilge</td><td>100 Analiz Hakkı</td><td>249 TL</td></tr>
          </tbody>
        </table>
        <p>Satın alınan krediler tamamen dijital hizmet niteliğinde olup fiziki teslimat bulunmamaktadır.</p>

        <h2>4. Sipariş, Ödeme ve Teslimat</h2>
        <p>
          Ödeme işlemleri BDDK lisanslı güvenli ödeme altyapısı üzerinden şifrelenmiş olarak gerçekleştirilir.
          Ödeme onaylanmasıyla birlikte dijital krediler anında ve otomatik olarak Alıcı'nın hesabına teslim edilir.
        </p>

        <h2>5. Cayma Hakkı İstisnası</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ğ maddesi uyarınca; elektronik ortamda anında ifa edilen
          hizmetlerde cayma hakkı kullanılamaz. Alıcı, siparişi onayladığı anda cayma hakkının sona ereceğini
          kabul eder.
        </p>

        <h2>6. Uyuşmazlıkların Çözümü</h2>
        <p>
          Uyuşmazlıklarda Alıcı'nın yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>

        <h2>7. Yürürlük</h2>
        <p>Alıcı, ödeme işlemini gerçekleştirmeden önce bu sözleşmeyi okuduğunu ve kabul ettiğini beyan eder.</p>

        <h2>8. İletişim</h2>
        <p>
          Yetkili: Fikri Emre Topcu<br />
          E-posta: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>
      </div>
    </div>
  );
}