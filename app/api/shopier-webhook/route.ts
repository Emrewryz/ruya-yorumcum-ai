
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

// Webhook loglarında tutarlılık için tip tanımı
type WebhookData = {
  platform_order_id: string;
  price: string;
  buyer_email: string; // Shopier bazen 'email', bazen 'buyer_email' gönderebilir, formData kontrolünde bakacağız.
};

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK GELDİ ---");

    // 1. Form Verisini Al
    const formData = await request.formData();
    // Shopier bazen 'res' ve 'hash', bazen direkt field'ları dönebilir.
    // Senin kodun 'res' (base64) üzerinden gidiyor, bu Shopier'in "Secure Mode"udur. Doğru.
    const resData = formData.get('res'); 
    const hash = formData.get('hash'); 

    // Kontrol: Parametreler eksik mi?
    if (!resData || !hash) {
        console.error("❌ HATA: Shopier parametreleri eksik.");
        return new NextResponse('Missing parameters', { status: 400 });
    }

    // 2. Kimlik Bilgilerini Al
    const shopierUser = process.env.SHOPIER_API_USER;
    const shopierPass = process.env.SHOPIER_API_SECRET; // .env isimlendirmene dikkat et

    if (!shopierUser || !shopierPass) {
        console.error("❌ HATA: .env dosyasında SHOPIER bilgileri eksik!");
        return new NextResponse('Server Config Error', { status: 500 });
    }

    // 3. İMZA DOĞRULAMA (Güvenlik)
    const expectedHash = crypto
        .createHmac('sha256', shopierPass)
        .update(String(resData) + shopierUser)
        .digest('hex');

    if (String(hash) !== expectedHash) {
        console.error("❌ HATA: Geçersiz İmza! (Fake Request Olabilir)");
        return new NextResponse('Invalid Hash', { status: 400 });
    }

    // 4. Şifreli Veriyi Çöz
    const buffer = Buffer.from(String(resData), 'base64');
    const jsonString = buffer.toString('utf-8');
    const data = JSON.parse(jsonString);

    // Veri isimlerini normalize edelim (Shopier dönüşüne göre)
    const orderId = String(data.orderid || data.platform_order_id);
    const paidAmount = parseFloat(String(data.price || data.total_order_value));
    const rawEmail = String(data.email || data.buyer_email || "");

    console.log(`✅ Doğrulama Başarılı. Sipariş: #${orderId}, Tutar: ${paidAmount} TL`);

    // 5. KREDİ MİKTARINI BELİRLEME
    let creditsToAdd = 0;
    let packageName = 'Özel Yükleme';

    // Fiyat aralıklarını biraz toleranslı yapalım (Kuruş farkları için)
    if (paidAmount >= 38 && paidAmount <= 45) { // 39 TL
        creditsToAdd = 5;
        packageName = 'Başlangıç Paketi';
    } 
    else if (paidAmount >= 125 && paidAmount <= 135) { // 129 TL
        creditsToAdd = 20;
        packageName = 'Keşif Paketi';
    }
    else if (paidAmount >= 240) { // 249 TL ve üzeri
        creditsToAdd = 50;
        packageName = 'Kahin Paketi';
    }
    else {
        console.log(`⚠️ Tanımsız Fiyat Aralığı: ${paidAmount} TL.`);
        // Yine de işlemi 'success' dönüyoruz ki Shopier sürekli denemesin.
        // Ama loglara "resolved: false" olarak düşeceğiz.
    }

    // --- SUPABASE BAĞLANTISI (SERVICE ROLE - ADMIN YETKİSİ) ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const cleanEmail = rawEmail.trim().toLowerCase();

    // 6. Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

    // KULLANICI YOKSA -> LOGLA
    if (userError || !userProfile) {
        console.error(`❌ Kullanıcı Bulunamadı: ${cleanEmail}`);
        
        await supabase.from('webhook_logs').insert({
            shopier_email: cleanEmail,
            shopier_order_id: orderId,
            plan_type: packageName,
            amount: paidAmount,
            error_message: `User not found. Credits pending: ${creditsToAdd}`,
            is_resolved: false
        });

        return new NextResponse('success', { status: 200 });
        
    }

    const userId = userProfile.id;

    // 7. GÜVENLİ KREDİ YÜKLEME (RPC)
    // Eğer fiyat tanımsızsa (creditsToAdd 0 ise) işlem yapma
    if (creditsToAdd > 0) {
        // Idempotency (Çift işlem önleme): Bu sipariş ID'si daha önce işlendi mi?
        const { data: existingTx } = await supabase
            .from('credit_transactions')
            .select('id')
            .eq('description', `Shopier Sipariş #${orderId}`)
            .single();

        if (existingTx) {
             console.log("ℹ️ Bu sipariş zaten işlenmiş.");
             return new NextResponse('success', { status: 200 });
        }

        const { data: txResult, error: rpcError } = await supabase.rpc('handle_credit_transaction', {
            p_user_id: userId,
            p_amount: creditsToAdd, 
            p_process_type: 'purchase', 
            p_description: `Shopier Sipariş #${orderId}`,
            p_metadata: { 
                shopier_order_id: orderId, 
                price: paidAmount,
                package: packageName 
            }
        });

        if (rpcError || (txResult && !txResult.success)) {
            console.error("❌ RPC Hatası:", rpcError);
            
            await supabase.from('webhook_logs').insert({
                shopier_email: cleanEmail,
                shopier_order_id: orderId,
                plan_type: packageName,
                amount: paidAmount,
                error_message: `RPC Error: ${JSON.stringify(rpcError)}`,
                is_resolved: false
            });
            return new NextResponse('DB Error', { status: 500 });
        }
        
        console.log(`🎉 KREDİ YÜKLENDİ: ${creditsToAdd} Kredi -> ${cleanEmail}`);
    }

    return new NextResponse('success', { status: 200 });

  } catch (err: any) {
    console.error("🔥 Webhook Fatal Error:", err.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
}