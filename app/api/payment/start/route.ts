import { createClient } from "@/utils/supabase/server";
import { generateShopierForm } from "@/utils/shopier";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. URL'den hangi paketi istediğini alıyoruz
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('plan'); 

    // 2. Kullanıcı giriş yapmış mı kontrol ediyoruz
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın" }, { status: 401 });
    }

    // 3. VERİTABANI BAĞLANTISI (Şemana Uygun)
    // Profiles tablosundan kullanıcının adını çekiyoruz.
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Paket Fiyatlarını Belirliyoruz
    let price = 0;
    let productName = "";

    if (planType === "pro") {
      price = 119;
      productName = "Kaşif Paketi (1 Aylık)";
    } else if (planType === "elite") {
      price = 299;
      productName = "Kahin Paketi (1 Aylık)";
    } else {
      return NextResponse.json({ error: "Geçersiz paket" }, { status: 400 });
    }

    // Benzersiz Sipariş Numarası
    const orderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. PAYMENTS TABLOSUNA KAYIT (Şemana Uygun)
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,        // payments tablosunda user_id foreign key olarak tanımlı
        order_id: orderId,       // order_id text ve unique
        amount: price,           // amount numeric
        plan_type: planType,     // plan_type text
        status: 'pending'        // status varsayılan pending ama biz yine de yazalım
      });

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Veritabanı kaydı oluşturulamadı");
    }

    // 5. SHOPIER FORMUNU OLUŞTURMA
    // Burası 'profiles' tablosundan gelen gerçek veriyi kullanır
    
    // İsim Mantığı: Profilde isim varsa onu kullan, yoksa mail adresinin başını kullan
    const buyerName = profile?.full_name || user.email?.split('@')[0] || "Degerli Uye";
    
    // Mail Mantığı: Profilde mail varsa o, yoksa auth maili
    const buyerEmail = profile?.email || user.email || "musteri@example.com";

    const htmlForm = generateShopierForm({
      orderId,
      price,
      userEmail: buyerEmail,
      userName: buyerName, // <-- ARTIK GERÇEK İSİM GİDİYOR
      userPhone: "05555555555", // Profillerde telefon sütunu olmadığı için burayı dummy bırakıyoruz (Sorun olmaz)
      productName
    });

    // 6. YÖNLENDİRME
    return new NextResponse(htmlForm, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}