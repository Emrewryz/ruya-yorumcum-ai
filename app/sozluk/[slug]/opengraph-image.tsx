import { ImageResponse } from 'next/og'
import { createClient } from '@/utils/supabase/server'
 
export const runtime = 'edge'
export const alt = 'Rüya Yorumu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
 
export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: item } = await supabase.from('dream_dictionary').select('term').eq('slug', params.slug).single()
 
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom, #020617, #1e1b4b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'serif',
          borderBottom: '20px solid #fbbf24'
        }}
      >
        <div style={{ color: '#fbbf24', fontSize: 30, marginBottom: 20, letterSpacing: '4px' }}>RÜYAYORUMCUM.COM.TR</div>
        <div style={{ textAlign: 'center', padding: '0 40px' }}>
          {item?.term || 'Rüya Tabirleri'}
        </div>
        <div style={{ fontSize: 24, marginTop: 40, color: '#94a3b8' }}>İslami ve Yapay Zeka Destekli Analiz</div>
      </div>
    ),
    { ...size }
  )
}