import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";


export const metadata: Metadata = {
  title: "Rüya Yorumcum — Yapay Zeka Destekli Rüya Analizi",
  description: "Rüyanızı yazın, yapay zeka hem İslami hem psikolojik açıdan anında yorumlasın. Ücretsiz ilk analiz.",
};

export default function Page() {
  return <HomeClient />;
}