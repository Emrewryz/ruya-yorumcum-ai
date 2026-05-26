import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { refreshDailyCredits } from "@/app/actions/refresh-credits";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Yeni kullanıcı mı? personalization_data boşsa onboarding'e yönlendir
      const { data: profile } = await supabase
        .from("profiles")
        .select("personalization_data, credits, last_credit_refresh")
        .eq("id", user.id)
        .single();

      // Günlük kredi yenileme — giriş anında kontrol
      await refreshDailyCredits();

      const isEmpty =
        !profile?.personalization_data ||
        Object.keys(profile.personalization_data).length === 0;

      if (isEmpty) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}