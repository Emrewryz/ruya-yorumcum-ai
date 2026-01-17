import { createClient } from "@/utils/supabase/server";
import { generateShopierForm } from "@/utils/shopier";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('plan'); // URL'den planı alacağız (?plan=pro gibi)

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın" }, { status: 401 });
    }

    // Paket Bilgileri
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

    const orderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Veritabanına Kaydet
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount: price,
        plan_type: planType,
        status: 'pending'
      });

    if (dbError) throw new Error("DB Error");

    // 2. Shopier Formunu Oluştur
    const htmlForm = generateShopierForm({
      orderId,
      price,
      userEmail: user.email || "musteri@example.com",
      userName: "Degerli Uye",
      userPhone: "05555555555",
      productName
    });

    // 3. Formu HTML olarak döndür (Tarayıcı bunu açınca otomatik Shopier'e gider)
    return new NextResponse(htmlForm, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}