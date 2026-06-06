import { createClient } from "@/utils/supabase/server";
import { NextResponse }  from "next/server";
import { refreshDailyCredits } from "@/app/actions/refresh-credits";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next"); // ← giriş öncesi sayfa

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Günlük kredi yenileme
      await refreshDailyCredits();

      const { data: profile } = await supabase
        .from("profiles")
        .select("personalization_data")
        .eq("id", user.id)
        .single();

      const isEmpty =
        !profile?.personalization_data ||
        Object.keys(profile.personalization_data).length === 0;

      // Yeni kullanıcı → onboarding
      // next varsa onboarding tamamlanınca oraya dön
      if (isEmpty) {
        const onboardingUrl = next
          ? `${origin}/onboarding?next=${encodeURIComponent(next)}`
          : `${origin}/onboarding`;
        return NextResponse.redirect(onboardingUrl);
      }

      // Mevcut kullanıcı → next'e veya ana sayfaya
      const safeNext = next?.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Kod yoksa veya kullanıcı yoksa ana sayfaya
  return NextResponse.redirect(`${origin}/`);
}