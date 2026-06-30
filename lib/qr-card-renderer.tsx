import { ImageResponse } from 'next/og'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

const W = 1240
const H = 1754

function hex(color: string, alpha: number) {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

let cachedIcon: string | null = null
function getIcon(): string {
  if (cachedIcon !== null) return cachedIcon
  try {
    cachedIcon = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), 'public', 'icon.png')).toString('base64')}`
  } catch {
    cachedIcon = ''
  }
  return cachedIcon
}

async function makeQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 600,
    margin: 1,
    color: { dark: '#111827', light: '#ffffff' },
  })
}

function StepList({ steps, accent }: { steps: string[]; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            backgroundColor: i === 0 ? hex(accent, 0.06) : '#f9fafb',
            borderRadius: 20,
            padding: '22px 26px',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: hex(accent, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: accent,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{step}</div>
        </div>
      ))}
    </div>
  )
}

const JOIN_STEPS = [
  'Open your phone camera and scan this QR code',
  'Enter your name to join the event room',
  'Upload and view shared photos instantly',
]

const WALL_STEPS = [
  'Open your phone camera and scan this QR code',
  'View all approved event photos in real time',
  'Perfect for big screens and live displays',
]

export interface RoomJoinCardParams {
  roomName: string
  joinCode: string
  appUrl: string
}

export async function renderRoomJoinCardPng(params: RoomJoinCardParams): Promise<Buffer> {
  const { roomName, joinCode, appUrl } = params
  const joinUrl = `${appUrl}/join?code=${joinCode}`
  const accent = '#2563eb'
  const icon = getIcon()
  const qrDataUrl = await makeQrDataUrl(joinUrl)

  const response = new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, backgroundColor: '#ffffff' }}>
        <div style={{ height: 16, width: '100%', backgroundColor: accent }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 96px', flexGrow: 1, gap: 48 }}>
          {/* Platform header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {icon && <img src={icon} width={80} height={80} style={{ borderRadius: 18 }} />}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>OMNI Share</div>
              <div style={{ fontSize: 17, color: '#9ca3af' }}>Event Photo Sharing</div>
            </div>
          </div>

          {/* Room name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 66, fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.1 }}>
              {roomName}
            </div>
            <div style={{ fontSize: 24, color: '#6b7280', textAlign: 'center' }}>
              Scan below to join and share photos
            </div>
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 32px 24px', borderRadius: 32, borderWidth: 3, borderStyle: 'solid', borderColor: hex(accent, 0.2), backgroundColor: hex(accent, 0.03) }}>
            <img src={qrDataUrl} width={580} height={580} />
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 22, color: '#6b7280' }}>Code:</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: accent, letterSpacing: '0.2em', fontFamily: 'monospace' }}>{joinCode}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 16, color: '#9ca3af', textAlign: 'center' }}>{joinUrl}</div>
          </div>

          <StepList steps={JOIN_STEPS} accent={accent} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px 96px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f3f4f6' }}>
          {icon && <img src={icon} width={24} height={24} style={{ borderRadius: 6 }} />}
          <div style={{ fontSize: 18, color: '#9ca3af' }}>Powered by OMNI Share</div>
        </div>

        <div style={{ height: 16, width: '100%', backgroundColor: accent }} />
      </div>
    ),
    { width: W, height: H }
  )

  return Buffer.from(await response.arrayBuffer())
}

export interface RoomWallCardParams {
  roomName: string
  roomId: string
  appUrl: string
}

export async function renderRoomWallCardPng(params: RoomWallCardParams): Promise<Buffer> {
  const { roomName, roomId, appUrl } = params
  const wallUrl = `${appUrl}/room/${roomId}/wall`
  const accent = '#7c3aed'
  const icon = getIcon()
  const qrDataUrl = await makeQrDataUrl(wallUrl)

  const response = new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, backgroundColor: '#ffffff' }}>
        <div style={{ height: 16, width: '100%', backgroundColor: accent }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 96px', flexGrow: 1, gap: 48 }}>
          {/* Platform header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {icon && <img src={icon} width={80} height={80} style={{ borderRadius: 18 }} />}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>OMNI Share</div>
              <div style={{ fontSize: 17, color: '#9ca3af' }}>Live Photo Wall</div>
            </div>
          </div>

          {/* Room name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 66, fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.1 }}>
              {roomName}
            </div>
            <div style={{ fontSize: 24, color: '#6b7280', textAlign: 'center' }}>
              Scan to view the live photo wall
            </div>
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 32px 24px', borderRadius: 32, borderWidth: 3, borderStyle: 'solid', borderColor: hex(accent, 0.2), backgroundColor: hex(accent, 0.03) }}>
            <img src={qrDataUrl} width={580} height={580} />
            <div style={{ marginTop: 16, fontSize: 16, color: '#9ca3af', textAlign: 'center' }}>{wallUrl}</div>
          </div>

          <StepList steps={WALL_STEPS} accent={accent} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px 96px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f3f4f6' }}>
          {icon && <img src={icon} width={24} height={24} style={{ borderRadius: 6 }} />}
          <div style={{ fontSize: 18, color: '#9ca3af' }}>Powered by OMNI Share</div>
        </div>

        <div style={{ height: 16, width: '100%', backgroundColor: accent }} />
      </div>
    ),
    { width: W, height: H }
  )

  return Buffer.from(await response.arrayBuffer())
}
