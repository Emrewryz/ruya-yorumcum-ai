import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Cevap nesnesini hazırla
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Supabase istemcisini oluştur
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

  // 3. Kullanıcı oturumunu kontrol et
  // DİKKAT: getUser kullanıyoruz çünkü getSession güvenli değildir.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- KURAL 1: GİRİŞ YAPMAMIŞ KULLANICIYI KORU ---
  // Kullanıcı YOKSA ve Dashboard'a girmeye çalışıyorsa -> Ana Sayfaya (Login) at
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; 
    return NextResponse.redirect(url);
  }

  // --- KURAL 2: GİRİŞ YAPMIŞ KULLANICIYI YÖNLENDİR ---
  // Kullanıcı VARSA ve Ana Sayfadaysa (Login ekranı) -> Dashboard'a at
  if (user && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  
  // Kullanıcı VARSA ve /auth sayfasına girmeye çalışıyorsa -> Dashboard'a at
   if (user && request.nextUrl.pathname.startsWith("/auth")) {
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
     * - images, public klasöründeki dosyalar vb.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};