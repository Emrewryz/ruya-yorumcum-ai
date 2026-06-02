import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { refreshDailyCredits } from "@/app/actions/refresh-credits";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next"); // ← ekle

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("personalization_data, credits, last_credit_refresh")
        .eq("id", user.id)
        .single();

      await refreshDailyCredits();

      const isEmpty =
        !profile?.personalization_data ||
        Object.keys(profile.personalization_data).length === 0;

      // Yeni kullanıcı → onboarding (next parametresi görmezden gelinir)
      if (isEmpty) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // next parametresi varsa oraya, yoksa ana sayfaya ← değişen yer
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}