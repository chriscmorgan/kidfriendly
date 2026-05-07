import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KidFriendlyEats — Find venues where you can eat and the kids can actually play'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #b8e4e4 0%, #cceece 55%, #e8f5f0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 28, lineHeight: 1 }}>🛝☕</div>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#2c2c2c', textAlign: 'center', lineHeight: 1.1 }}>
          KidFriendlyEats
        </div>
        <div style={{ fontSize: 30, color: '#4a7a7a', textAlign: 'center', marginTop: 20, maxWidth: 860, lineHeight: 1.3 }}>
          Find venues where you can eat and the kids can actually play
        </div>
        <div style={{ fontSize: 22, color: '#38a5a0', marginTop: 28, fontWeight: 600, letterSpacing: 1 }}>
          kidfriendlyeats.space · Melbourne
        </div>
      </div>
    ),
    { ...size }
  )
}
