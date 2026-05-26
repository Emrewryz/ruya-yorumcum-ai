import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Yeni kullanıcı mı? personalization_data boşsa onboarding'e yönlendir
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("personalization_data")
        .eq("id", user.id)
        .single();

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