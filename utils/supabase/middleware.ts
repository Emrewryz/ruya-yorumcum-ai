import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Kullanıcıyı kontrol et
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // KORUMA KURALI: Eğer kullanıcı yoksa ve /dashboard'a girmeye çalışıyorsa login'e at.
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") && // /auth ile başlayan yollara izin ver
    request.nextUrl.pathname.startsWith("/dashboard") // sadece dashboard'u koru
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // Giriş sayfasına yönlendir
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}