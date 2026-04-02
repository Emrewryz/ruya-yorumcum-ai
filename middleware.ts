import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- KURAL 0: STATİK DOSYA VE BOT KORUMASI (EN ÜSTTE OLMALI) ---
  // Eğer istek ads.txt, robots.txt veya sitemap.xml ise,
  // Hiçbir işlem yapmadan, auth kontrolüne sokmadan direkt geçir.
  if (
    path === '/ads.txt' || 
    path === '/robots.txt' || 
    path === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Shopier Webhook İstisnası
  if (path.startsWith('/api/shopier-webhook')) {
    return NextResponse.next();
  }

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
          cookiesToSet.forEach(({ name, value }) =>
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

  // --- FREEMIUM GÜVENLİK DUVARI (DASHBOARD KORUMASI) ---
  if (!user && path.startsWith("/dashboard")) {
    
    // MİSAFİRLERE İZİN VERİLEN ROTASLAR (Whitelist)
    // Sadece bu sayfalara üye olmadan girilebilir.
    const allowedGuestPaths = [
      "/dashboard", 
      "/dashboard/ruya-analizi", 
      "/dashboard/tarot"
    ];

    // Eğer kullanıcının gitmek istediği yol beyaz listede YOKSA:
    if (!allowedGuestPaths.includes(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      // Kayıt olduktan sonra kaldığı yere dönebilmesi için gitmek istediği adresi hafızaya alıyoruz
      url.searchParams.set("redirect", path); 
      return NextResponse.redirect(url);
    }
  }

  // --- AUTH SAYFASI KORUMASI ---
  // Eğer kullanıcı zaten giriş yapmışsa ve /auth sayfasına gitmeye çalışıyorsa,
  // (Ancak /auth/callback sayfasına Google girişi için izin vermeliyiz)
  if (user && path.startsWith("/auth") && !path.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};