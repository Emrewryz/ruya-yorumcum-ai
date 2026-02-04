import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // -----------------------------------------------------------------
  // 1. SHOPIER WEBHOOK İSTİSNASI (EN KRİTİK NOKTA)
  // -----------------------------------------------------------------
  // Shopier'den gelen ödeme bildirimlerini güvenlik kontrolüne sokmadan
  // doğrudan içeri alıyoruz. Aksi takdirde 307 Redirect hatası alırsın.
  if (path.startsWith('/api/shopier-webhook')) {
    return NextResponse.next();
  }
  // -----------------------------------------------------------------

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- KURAL 2: DASHBOARD KORUMASI ---
  // Eğer kullanıcı GİRİŞ YAPMAMIŞSA ve /dashboard ile başlayan bir yere girmeye çalışıyorsa
  // Onu Ana Sayfaya (Login ekranına) gönder.
  if (!user && path.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; 
    return NextResponse.redirect(url);
  }

  // --- KURAL 3: AUTH SAYFASI KORUMASI ---
  // Eğer kullanıcı ZATEN GİRİŞ YAPMIŞSA ve /auth (giriş/kayıt) sayfasına girmeye çalışıyorsa
  // Onu Dashboard'a yönlendir (Giriş yapmış adamın login sayfasında işi yok).
  if (user && path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler HARİÇ tüm yolları eşleştir:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico (favicon)
     * - api (API route'ları etkilenmesin)
     * Not: Shopier webhook için yukarıya kodla da istisna ekledik, 
     * buradaki regex bazen kaçırabiliyor, kod tarafı garantidir.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};