export const dynamic = 'force-dynamic';
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Giris yap" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');
    
    // Paket Bilgileri
    let price = plan === 'elite' ? 299 : 119;
    let productName = plan === 'elite' ? "RUYA YORUMCUM KAHIN" : "RUYA YORUMCUM KASIF";

    // Modül Ayarları sayfasındaki bilgiler
    const apiKey = "1180c7f5d9c933234b8d4e6c3c8c8847"; 
    const websiteIndex = 3; //

    // Bu yöntem daha az parametre istediği için hata payı düşüktür.
    const htmlForm = `
      <!DOCTYPE html>
      <html>
      <body>
        <form action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post" id="shopier_form">
          <input type="hidden" name="API_key" value="${apiKey}">
          <input type="hidden" name="website_index" value="${websiteIndex}">
          <input type="hidden" name="platform_order_id" value="${Date.now()}">
          <input type="hidden" name="product_name" value="${productName}">
          <input type="hidden" name="product_type" value="1"> <input type="hidden" name="buyer_name_last" value="Kullanici">
          <input type="hidden" name="buyer_name_first" value="Musteri">
          <input type="hidden" name="buyer_email" value="${user.email}">
          <input type="hidden" name="total_order_value" value="${price}">
          <input type="hidden" name="currency" value="0">
          <input type="hidden" name="custom_param" value="${user.id}">
          </form>
        <script>document.getElementById("shopier_form").submit();</script>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}