import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "Rüya Yorumcum mesafeli satış sözleşmesi.",
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
          İşbu sözleşme; Alıcı'nın Satıcı'ya ait Rüya Yorumcum platformu üzerinden elektronik ortamda siparişini verdiği dijital kredi paketlerinin (Tekli Rapor, Kâşif Paketi, Laboratuvar Paketi) satışı ve ifasına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.
        </p>

        <h2>3. Ürün ve Hizmet Bilgileri</h2>
        <p>Sözleşme konusu hizmet, yapay zeka destekli metin analizinde kullanılmak üzere hesaba tanımlanan dijital kredilerdir.</p>
        <table>
          <thead>
            <tr>
              <th>Paket Adı</th>
              <th>İçerik (Kapasite)</th>
              <th>Satış Fiyatı (KDV Dahil)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Tekli Rapor</td><td>1 Analiz Hakkı</td><td>39 TL</td></tr>
            <tr><td>Kâşif Paketi</td><td>3 Analiz Hakkı</td><td>89 TL</td></tr>
            <tr><td>Laboratuvar Paketi</td><td>10 Analiz Hakkı</td><td>169 TL</td></tr>
          </tbody>
        </table>
        <p>
          Satın alınan krediler tamamen dijital hizmet niteliğinde olup, fiziki kargo veya teslimat süreci bulunmamaktadır.
        </p>

        <h2>4. Sipariş, Ödeme ve Teslimat</h2>
        <p>
          Ödeme işlemleri, BDDK (Bankacılık Düzenleme ve Denetleme Kurumu) lisanslı güvenli sanal POS ödeme kuruluşları altyapısı üzerinden şifrelenmiş olarak gerçekleştirilir. Satıcı, Alıcı'ya ait kredi kartı bilgilerini hiçbir şekilde göremez ve saklayamaz.
        </p>
        <p>
          Ödeme işleminin banka tarafından onaylanmasıyla birlikte, sözleşme konusu dijital krediler anında ve otomatik olarak Alıcı'nın platformdaki hesabına teslim edilir (tanımlanır).
        </p>

        <h2>5. Cayma Hakkı İstisnası</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği'nin "Cayma Hakkının İstisnaları" başlıklı 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; <strong>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde"</strong> cayma hakkı kullanılamaz. 
        </p>
        <p>
          Alıcı, işbu sözleşmeye konu olan dijital analiz kredilerinin bu kapsamda olduğunu ve siparişi onayladığı anda cayma hakkının sona ereceğini kabul, beyan ve taahhüt eder.
        </p>

        <h2>6. Uyuşmazlıkların Çözümü</h2>
        <p>
          İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dâhilinde Alıcı'nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>

        <h2>7. Yürürlük</h2>
        <p>
          Alıcı, platform üzerinden ödeme işlemini gerçekleştirmeden önce bu sözleşmenin tüm koşullarını okuduğunu, anladığını ve elektronik ortamda onayladığını kabul eder.
        </p>

        <h2>8. İletişim</h2>
        <p>
          Yetkili: Fikri Emre Topcu<br />
          E-posta: <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>

      </div>
    </div>
  );
}