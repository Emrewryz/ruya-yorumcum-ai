import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import ViralTestClient from "./ViralTestClient";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("viral_tests")
    .select("title, description")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  const title = data?.title ?? "Psikoloji Testi — Rüya Yorumcum";
  const desc  = data?.description ?? "Bilinçaltını keşfet. Ücretsiz psikoloji testi.";

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/testler/${params.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/testler/${params.slug}`,
      type: "website",
    },
  };
}

export default function TestlerSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ViralTestClient slug={params.slug} />;
}