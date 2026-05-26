import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İptal ve İade Koşulları",
  description: "Rüya Yorumcum iptal ve iade politikası.",
};

export default function IptalIadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="prose prose-zinc prose-sm max-w-none">

        <h1>İptal ve İade Koşulları</h1>
        <p className="lead">Son güncelleme: Ocak 2026</p>

        <h2>1. Genel İlke</h2>
        <p>
          Rüya Yorumcum platformu üzerinden satın alınan kredi
          paketleri dijital hizmet niteliğindedir. Satın alma
          işleminin tamamlanmasıyla birlikte krediler anında hesaba
          tanımlanır.
        </p>

        <h2>2. İade Koşulları</h2>

        <h3>2a. İade Yapılmayan Durumlar</h3>
        <ul>
          <li>
            Kullanılmış (harcanmış) krediler hiçbir koşulda iade edilmez.
          </li>
          <li>
            Satın alma işleminin üzerinden 14 günden fazla süre geçmişse
            iade talep edilemez.
          </li>
          <li>
            Dijital içeriğin tüketici tarafından onaylanarak kullanılmaya
            başlandığı durumlarda 6502 sayılı Kanun kapsamındaki cayma
            hakkı uygulanmaz.
          </li>
        </ul>

        <h3>2b. İade Yapılabilecek Durumlar</h3>
        <ul>
          <li>
            Satın alım sonrası hiçbir kredi kullanılmamışsa ve talep
            14 gün içinde iletilmişse tam iade değerlendirilebilir.
          </li>
          <li>
            Teknik bir hata nedeniyle kredi yüklenmemişse veya yanlış
            paket uygulanmışsa tam iade yapılır.
          </li>
          <li>
            Çift ödeme veya sistem hatası kaynaklı fazla tahsilatlarda
            fark iade edilir.
          </li>
        </ul>

        <h2>3. İptal Süreci</h2>
        <p>
          İptal ve iade taleplerinizi aşağıdaki bilgilerle birlikte
          e-posta yoluyla iletebilirsiniz:
        </p>
        <ul>
          <li>Kayıtlı e-posta adresiniz</li>
          <li>Sipariş / işlem numaranız</li>
          <li>Talep gerekçeniz</li>
        </ul>
        <p>
          İletişim:{" "}
          <a href="mailto:iletisim@ruyayorumcum.com">iletisim@ruyayorumcum.com</a>
        </p>
        <p>
          Talepler iş günleri içinde en geç 3 iş günü içinde
          yanıtlanır. Onaylanan iadeler ödeme yöntemine bağlı
          olarak 5–10 iş günü içinde tamamlanır.
        </p>

        <h2>4. Teknik Arızalarda Kredi Koruması</h2>
        <p>
          Yapay zeka analizi sırasında sistem hatası yaşanırsa
          harcanan kredi otomatik olarak iade edilir. Bu işlem
          herhangi bir talep gerekmeksizin arka planda gerçekleşir.
        </p>

        <h2>5. İletişim</h2>
        <p>
          <a href="mailto:iletisim@ruyayorumcum.com">iletisim@ruyayorumcum.com</a>
        </p>

      </div>
    </div>
  );
}