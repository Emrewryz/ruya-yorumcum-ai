import { NextResponse } from "next/server";
import { generateDictionaryEntry } from "@/app/actions/generate-dictionary-entry";

export async function POST(req: Request) {
  const { dreamText, secret } = await req.json();

  // Basit güvenlik — dışarıdan rastgele çağrılmasın
  if (secret !== process.env.DICT_GEN_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Burada await VAR — API route Vercel'de tamamlanana kadar yaşar
  await generateDictionaryEntry(dreamText);
  return NextResponse.json({ ok: true });
}