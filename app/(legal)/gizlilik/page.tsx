import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Rüya Yorumcum gizlilik politikası ve kişisel veri işleme prensipleri.",
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="prose prose-zinc prose-sm max-w-none">

        <h1>Gizlilik Politikası</h1>
        <p className="lead">Son güncelleme: Haziran 2026</p>

        <p>
          Rüya Yorumcum platformu ve veri sorumlusu Fikri Emre Topcu ("biz", "hizmet") olarak kişisel verilerinizin korunmasını ciddiye alıyor, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve yürürlükteki mevzuata uygun hareket ediyoruz.
        </p>

        <h2>1. Toplanan Veriler</h2>
        <p>Hizmetimizi kullanırken şu veriler toplanabilir:</p>
        <ul>
          <li><strong>Hesap verileri:</strong> Ad-soyad, e-posta adresi, şifre (şifreli olarak saklanır).</li>
          <li><strong>Kullanım verileri:</strong> Girilen rüya metinleri, yapay zeka analiz sonuçları, sohbet geçmişi.</li>
          <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, oturum bilgileri.</li>
          <li><strong>Ödeme verileri:</strong> Sipariş numarası ve paket bilgisi (Kredi kartı bilgileriniz tarafımızda kesinlikle saklanmaz; BDDK lisanslı ödeme kuruluşumuzun güvenli altyapısı üzerinden doğrudan işlenir).</li>
          <li><strong>Çerezler:</strong> Oturum sürekliliği ve tercihlerinizi hatırlamak için kullanılır.</li>
        </ul>

        <h2>2. Verilerin Kullanım Amacı</h2>
        <ul>
          <li>Hizmetin sunulması, dijital kredilerin tanımlanması ve kişiselleştirilmesi.</li>
          <li>Yapay zeka analiz kalitesinin artırılması.</li>
          <li>Ödeme işlemlerinin güvenli bir şekilde gerçekleştirilmesi.</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
          <li>Güvenlik ve dolandırıcılık önleme.</li>
        </ul>

        <h2>3. Veri Paylaşımı</h2>
        <p>
          Kişisel verileriniz; yasal zorunluluklar veya mahkeme kararı olmaksızın üçüncü taraflarla paylaşılmaz. Ödeme işlemleri için BDDK lisanslı sanal POS sağlayıcımıza yalnızca işlem tamamlama ve dolandırıcılık kontrolü amacıyla gerekli minimum sipariş verisi iletilir.
        </p>

        <h2>4. Veri Saklama Süresi</h2>
        <p>
          Verileriniz, hesabınız aktif olduğu süre boyunca ve hesap silme talebinizden itibaren yasal saklama yükümlülükleri (ticari kayıtlar ve elektronik ticaret mevzuatı gereği) gözetilerek saklanır.
        </p>

        <h2>5. Haklarınız (KVKK Madde 11)</h2>
        <ul>
          <li>Verilerinizin işlenip işlenmediğini öğrenme.</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
          <li>Yanlış veya eksik verilerin düzeltilmesini isteme.</li>
          <li>Verilerin silinmesini veya yok edilmesini talep etme.</li>
          <li>Otomatik sistemler aracılığıyla aleyhinize oluşan sonuçlara itiraz etme.</li>
        </ul>
        <p>
          Talepleriniz için:{" "}
          <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>

        <h2>6. Çerezler</h2>
        <p>
          Sitemiz; oturum yönetimi, kullanıcı tercihleri ve misafir kimlik tanımlama amacıyla zorunlu çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler ve oturum akışları çalışmayabilir.
        </p>

        <h2>7. Güvenlik</h2>
        <p>
          Verileriniz modern bulut altyapısında şifreli olarak saklanır. TLS/SSL ile iletim güvenliği (HTTPS) sağlanır. Şifreler hiçbir zaman düz metin olarak depolanmaz.
        </p>

        <h2>8. İletişim</h2>
        <p>
          Veri Sorumlusu: Fikri Emre Topcu<br />
          E-posta:{" "}
          <a href="mailto:fikriemretopcu07s@gmail.com">fikriemretopcu07s@gmail.com</a>
        </p>

      </div>
    </div>
  );
}