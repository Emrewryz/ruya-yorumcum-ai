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
        <p className="lead">Son güncelleme: Haziran 2026</p>

        <h2>1. Genel İlke</h2>
        <p>
          Rüya Yorumcum platformu (Fikri Emre Topcu) üzerinden satın alınan kredi paketleri (E-Pin / Dijital Bakiye) anında ifa edilen dijital hizmet niteliğindedir. Satın alma işleminin tamamlanmasıyla birlikte krediler anında kullanıcı hesabına tanımlanır.
        </p>

        <h2>2. İade Koşulları ve Cayma Hakkı İstisnası</h2>

        <h3>2a. İade Yapılmayan Durumlar (Cayma Hakkının Geçerli Olmadığı Haller)</h3>
        <ul>
          <li>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ğ maddesi uyarınca; elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallar <strong>cayma hakkının istisnasıdır.</strong> Bu nedenle satın alınan dijital kredilerde cayma hakkı kullanılamaz.
          </li>
          <li>Kısmen veya tamamen kullanılmış (harcanmış) krediler hiçbir koşulda iade edilmez.</li>
        </ul>

        <h3>2b. İade Yapılabilecek Durumlar</h3>
        <ul>
          <li>
            Satın alım sonrası hiçbir kredi kullanılmamışsa ve talep 14 gün içinde iletilmişse müşteri memnuniyeti kapsamında tam iade değerlendirilebilir.
          </li>
          <li>
            Sistemsel veya teknik bir hata nedeniyle ödeme alınmasına rağmen kredi hesaba yüklenmemişse tam iade yapılır.
          </li>
          <li>
            Kredi kartından çift çekim veya sistem hatası kaynaklı fazla tahsilat yapılması durumunda fark iade edilir.
          </li>
        </ul>

        <h2>3. İptal ve İade Süreci</h2>
        <p>
          İptal ve iade taleplerinizi aşağıdaki bilgilerle birlikte e-posta yoluyla iletebilirsiniz:
        </p>
        <ul>
          <li>Kayıtlı e-posta adresiniz</li>
          <li>Sipariş veya referans numaranız</li>
          <li>Talep gerekçeniz</li>
        </ul>
        <p>
          İletişim:{" "}
          <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>
        <p>
          Talepleriniz incelendikten sonra en geç 3 iş günü içinde yanıtlanır. Onaylanan iadeler BDDK lisanslı ödeme kuruluşumuz aracılığıyla gerçekleştirilir ve bankanızın prosedürüne bağlı olarak 3–10 iş günü içinde kartınıza yansır.
        </p>

        <h2>4. Teknik Arızalarda Kredi Koruması</h2>
        <p>
          Yapay zeka analizi sırasında API kaynaklı bir sistem hatası yaşanır ve tahlil üretilemezse, harcanan kredi otomatik olarak hesabınıza iade edilir. Bu işlem herhangi bir talep gerekmeksizin arka planda gerçekleşir.
        </p>

        <h2>5. İletişim</h2>
        <p>
          Yetkili: Fikri Emre Topcu<br />
          E-posta:{" "}
          <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>

      </div>
    </div>
  );
}