import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bekleyenleri Getir
export async function GET() {
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('is_resolved', false) // Çözülmemişleri getir
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Bir kaydı "Çözüldü" olarak işaretle (Silme veya güncelleme)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const { error } = await supabase
        .from('webhook_logs')
        .update({ is_resolved: true }) // Silmiyoruz, arşivlendi diyoruz
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}