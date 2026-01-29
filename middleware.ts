import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  const path = request.nextUrl.pathname;

  // --- KURAL 1: DASHBOARD KORUMASI ---
  // Eğer kullanıcı GİRİŞ YAPMAMIŞSA ve /dashboard ile başlayan bir yere girmeye çalışıyorsa
  // Onu Ana Sayfaya (Login ekranına) gönder.
  if (!user && path.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; 
    return NextResponse.redirect(url);
  }

  // --- KURAL 2: AUTH SAYFASI KORUMASI ---
  // Eğer kullanıcı ZATEN GİRİŞ YAPMIŞSA ve /auth (giriş/kayıt) sayfasına girmeye çalışıyorsa
  // Onu Dashboard'a yönlendir (Giriş yapmış adamın login sayfasında işi yok).
  // DİKKAT: Buradan '/' (Ana Sayfa) kontrolünü kaldırdık. Artık ana sayfaya dönebilirsin.
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
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};