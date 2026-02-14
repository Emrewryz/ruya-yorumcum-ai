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

  // Dashboard Koruması
  if (!user && path.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Auth Sayfası Koruması
  if (user && path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Matcher ayarın gayet iyi, aynen kalabilir.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|robots.txt|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};