import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import KesfetClient from "@/components/KesfetClient";

export const metadata: Metadata = {
  title: "Rüya Keşfet — Topluluktan Yapay Zeka Rüya Görselleri | Rüya Yorumcum",
  description: "Yapay zeka ile görselleştirilmiş mistik, fantastik ve sürreal rüyaları keşfet. Topluluk rüya galerisi.",
  alternates: { canonical: "https://www.ruyayorumcum.com.tr/kesfet" },
  openGraph: {
    title: "Rüya Keşfet — Yapay Zeka Rüya Görselleri",
    description: "Yapay zeka ile görselleştirilmiş mistik, fantastik ve sürreal rüyaları keşfet.",
    url: "https://www.ruyayorumcum.com.tr/kesfet",
    type: "website",
  },
};

export const revalidate = 60;

export default async function KesfetPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("dream_images")
    .select(`
      id,
      dream_id,
      image_url,
      created_at,
      dreams (
        dream_title,
        dream_text,
        slug,
        category,
        tags,
        is_public
      )
    `)
    .eq("dreams.is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);

  // Sadece is_public = true olanları filtrele
  const dreams = (data ?? [])
    .filter((r: any) => r.dreams?.is_public && r.dreams?.slug)
    .map((r: any) => ({
      id:          r.id,
      dream_id:    r.dream_id,
      image_url:   r.image_url,
      created_at:  r.created_at,
      dream_title: r.dreams?.dream_title ?? null,
      dream_text:  r.dreams?.dream_text ?? "",
      slug:        r.dreams?.slug ?? null,
      category:    r.dreams?.category ?? null,
      tags:        r.dreams?.tags ?? null,
    }));

  return <KesfetClient dreams={dreams} />;
}