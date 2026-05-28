import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "crypto";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const OR_HEADERS = {
  "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type":  "application/json",
  "HTTP-Referer":  "https://ruyayorumcum.com.tr",
  "X-Title":       "Rüya Yorumcum",
};
const IMAGE_COST  = 4;
const BUCKET_NAME = "dream-images";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Faz 1: Türkçe rüya → Prompt + Kategori + Tags ───────────────────────────

interface DreamMeta {
  image_prompt: string;
  category:     string;
  tags:         string[];
}

async function buildImagePromptAndMeta(dreamText: string): Promise<DreamMeta> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method:  "POST",
    headers: OR_HEADERS,
    body: JSON.stringify({
      model:       "google/gemini-2.0-flash-lite-001",
      max_tokens:  200,
      temperature: 0.75,
      messages: [{
        role: "user",
        content:
          `Aşağıdaki Türkçe rüyayı analiz et ve SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:\n\n` +
          `{\n` +
          `  "image_prompt": "FLUX görsel üretici için İngilizce, virgüllerle ayrılmış, sinematik, sürreal, 8k resolution, masterpiece içeren max 50 kelimelik prompt. Rüyadaki ana sembol ve atmosferi yansıt.",\n` +
          `  "category": "Şu kategorilerden SADECE BİRİNİ seç (başka kelime yazma): Mistik | Korku | Kabus | Fantastik | Günlük | Romantik | Macera",\n` +
          `  "tags": ["rüyadaki ana nesne veya kişi", "rüyanın ana duygusu", "rüyanın ana teması"]\n` +
          `}\n\n` +
          `Örnek tags: ["yılan", "korku", "dönüşüm"] veya ["uçmak", "özgürlük", "gökyüzü"]\n\n` +
          `Rüya: "${dreamText.slice(0, 500)}"`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`Meta üretimi başarısız: ${res.status}`);

  const data    = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";

  let meta: DreamMeta;
  try {
    const clean = content.replace(/```json|```/g, "").trim();
    meta        = JSON.parse(clean);
  } catch {
    // JSON parse başarısız — fallback
    meta = {
      image_prompt: content.slice(0, 200) || "cinematic surreal dream, 8k resolution, masterpiece",
      category:     "Mistik",
      tags:         [],
    };
  }

  // Validasyon
  if (!meta.image_prompt) meta.image_prompt = "cinematic surreal dream, 8k, masterpiece";
  if (!meta.category)     meta.category     = "Mistik";
  if (!Array.isArray(meta.tags)) meta.tags  = [];

  console.log("[gen-img] Meta:", JSON.stringify(meta));
  return meta;
}

// ─── Faz 2: Prompt → FLUX görsel ─────────────────────────────────────────────

async function generateFluxImage(prompt: string): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method:  "POST",
    headers: OR_HEADERS,
    body: JSON.stringify({
      model:      "black-forest-labs/flux.2-klein-4b",
      modalities: ["image"],
      messages:   [{ role: "user", content: prompt }],
      image_config: { image_size: "1024x1024" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FLUX hatası ${res.status}: ${err.slice(0, 300)}`);
  }

  const data    = await res.json();
  const message = data.choices?.[0]?.message;

  if (Array.isArray(message?.images) && message.images.length > 0) {
    const img = message.images[0];
    if (img?.url)            return img.url;
    if (img?.image_url?.url) return img.image_url.url;
    if (img?.b64_json)       return `data:image/png;base64,${img.b64_json}`;
  }

  console.error("[gen-img] Beklenmeyen yanıt:", JSON.stringify(data).slice(0, 500));
  throw new Error("FLUX yanıtından görsel çıkarılamadı.");
}

// ─── Faz 3: Görsel → WebP ────────────────────────────────────────────────────

async function convertToWebP(imageSource: string): Promise<Buffer> {
  let inputBuffer: Buffer;
  if (imageSource.startsWith("data:")) {
    inputBuffer = Buffer.from(imageSource.split(",")[1], "base64");
  } else {
    const res = await fetch(imageSource);
    if (!res.ok) throw new Error(`Görsel indirilemedi: ${res.status}`);
    inputBuffer = Buffer.from(await res.arrayBuffer());
  }
  return sharp(inputBuffer)
    .resize(1024, 1024, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();
}

// ─── Faz 4: Supabase Storage ──────────────────────────────────────────────────

async function uploadToStorage(buffer: Buffer, userId: string): Promise<string> {
  const supabase = getServiceClient();
  const fileName = `${userId}/${randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType:  "image/webp",
      cacheControl: "31536000",
      upsert:       false,
    });

  if (error) throw new Error(`Storage upload hatası: ${error.message}`);
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles").select("credits").eq("id", user.id).single();

  if (!profile || (profile.credits ?? 0) < IMAGE_COST) {
    return NextResponse.json(
      { error: `Görselleştirme için ${IMAGE_COST} kredi gerekiyor.` },
      { status: 403 }
    );
  }

  let dreamText = "";
  let dreamId   = "";
  try {
    const body = await request.json();
    dreamText  = body.dreamText?.trim() ?? "";
    dreamId    = body.dreamId   ?? "";
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (dreamText.length < 10) {
    return NextResponse.json({ error: "Rüya metni çok kısa." }, { status: 400 });
  }

  try {
    // Faz 1: Prompt + meta
    const meta = await buildImagePromptAndMeta(dreamText);

    // Faz 2: Görsel üret
    const imageSource = await generateFluxImage(meta.image_prompt);

    // Faz 3: WebP
    const webpBuffer = await convertToWebP(imageSource);

    // Faz 4: Storage
    const publicUrl = await uploadToStorage(webpBuffer, user.id);
    console.log("[gen-img] ✅ URL:", publicUrl);

    // Faz 5a: Kredi düş
    const { data: txResult, error: txError } = await supabase.rpc(
      "handle_credit_transaction",
      {
        p_user_id:      user.id,
        p_amount:       -IMAGE_COST,
        p_process_type: "spend",
        p_description:  "Rüya Görselleştirme",
        p_metadata:     { dream_id: dreamId, prompt: meta.image_prompt },
      }
    );
    if (txError || !txResult?.success) {
      console.error("[gen-img] Kredi hatası:", txError?.message);
    }

    // Faz 5b: dream_images tablosuna ekle + dreams'i güncelle
    if (dreamId) {
      const svc = getServiceClient();

      // Her yeni görsel ayrı kayıt — eski silinmez
      await svc
  .from("dream_images")
  .insert({
    dream_id:  dreamId,
    user_id:   user.id,
    image_url: publicUrl,
  });

      // dreams tablosundaki category/tags ve son image_url'i güncelle
      await supabase
        .from("dreams")
        .update({
          image_url: publicUrl,
          category:  meta.category,
          tags:      meta.tags,
        })
        .eq("id", dreamId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success:  true,
      imageUrl: publicUrl,
      prompt:   meta.image_prompt,
      category: meta.category,
      tags:     meta.tags,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[gen-img] Hata:", msg);
    return NextResponse.json(
      { error: "Görsel üretilirken sorun oluştu. Krediniz düşülmedi." },
      { status: 500 }
    );
  }
}