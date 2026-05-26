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
        <p className="lead">Son güncelleme: Ocak 2026</p>

        <h2>1. Taraflar</h2>
        <p>
          <strong>Satıcı:</strong> Rüya Yorumcum ("Hizmet Sağlayıcı")<br />
          E-posta: iletisim@ruyayorumcum.com<br />
          Web: ruyayorumcum.com
        </p>
        <p>
          <strong>Alıcı:</strong> Hizmeti satın alan kayıtlı kullanıcı ("Üye").
        </p>

        <h2>2. Sözleşmenin Konusu</h2>
        <p>
          İşbu sözleşme; Alıcı'nın Rüya Yorumcum platformu üzerinden
          satın aldığı dijital kredi paketlerine (Tekli Rapor, Kâşif
          Paketi, Laboratuvar Paketi) ilişkin koşulları düzenler.
          Satın alınan krediler, yapay zeka destekli rüya analizi
          hizmeti için kullanılır.
        </p>

        <h2>3. Ürün ve Hizmet Bilgileri</h2>
        <table>
          <thead>
            <tr>
              <th>Paket</th>
              <th>Kredi</th>
              <th>Fiyat</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Tekli Rapor</td><td>1 Analiz Hakkı</td><td>39 TL</td></tr>
            <tr><td>Kâşif Paketi</td><td>3 Analiz Hakkı</td><td>89 TL</td></tr>
            <tr><td>Laboratuvar Paketi</td><td>10 Analiz Hakkı</td><td>169 TL</td></tr>
          </tbody>
        </table>
        <p>
          Tüm fiyatlara KDV dahildir. Krediler dijital hizmet
          niteliğinde olup anlık olarak hesaba tanımlanır.
        </p>

        <h2>4. Sipariş ve Ödeme</h2>
        <p>
          Ödeme işlemleri Shopier ödeme altyapısı üzerinden güvenli
          biçimde gerçekleştirilir. Satıcı, kart bilgilerine erişemez
          ve bu bilgileri saklamaz. Ödeme onaylandıktan sonra
          krediler otomatik olarak hesaba yüklenir.
        </p>

        <h2>5. Teslimat</h2>
        <p>
          Satın alınan krediler dijital ürün niteliğinde olup ödeme
          onayının ardından anında Alıcı'nın hesabına tanımlanır.
          Herhangi bir fiziksel teslimat söz konusu değildir.
        </p>

        <h2>6. Cayma Hakkı</h2>
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 49.
          maddesi uyarınca; dijital içerik ve hizmetlerde, tüketicinin
          onayıyla ifaya başlanmış işlemlerde cayma hakkı kullanılamaz.
          Kredi kullanımına başlanması halinde ilgili krediler iade
          edilmez.
        </p>
        <p>
          Kullanılmamış krediler için iptal talebi{" "}
          <a href="mailto:iletisim@ruyayorumcum.com">iletisim@ruyayorumcum.com</a>{" "}
          adresine iletilerek değerlendirilir.
        </p>

        <h2>7. Uygulanacak Hukuk ve Yetki</h2>
        <p>
          İşbu sözleşme Türk Hukuku'na tabidir. Uyuşmazlıklarda
          Türkiye Cumhuriyeti mahkemeleri yetkilidir.
        </p>

        <h2>8. İletişim</h2>
        <p>
          <a href="mailto:iletisim@ruyayorumcum.com">iletisim@ruyayorumcum.com</a>
        </p>

      </div>
    </div>
  );
}