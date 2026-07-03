import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
]

function detectMimeFromBytes(buf: Uint8Array): string | null {
  for (const sig of MAGIC_BYTES) {
    const off = sig.offset ?? 0
    if (buf.length < off + sig.bytes.length) continue
    if (sig.bytes.every((b, i) => buf[off + i] === b)) return sig.mime
  }
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_suspended')
    .eq('id', user.id)
    .single()

  if (profile?.is_suspended) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

  // Read buffer first, then validate by magic bytes — never trust client-supplied MIME type
  const buffer = await file.arrayBuffer()
  const detectedMime = detectMimeFromBytes(new Uint8Array(buffer))
  if (!detectedMime || !ALLOWED_TYPES.includes(detectedMime)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const ext = detectedMime === 'image/png' ? 'png' : detectedMime === 'image/webp' ? 'webp' : 'jpg'
  const path = `banners/${user.id}/${Date.now()}.${ext}`

  const admin = createServiceRoleClient()
  const { error: uploadError } = await admin.storage
    .from('room-banners')
    .upload(path, buffer, { contentType: detectedMime, upsert: false })

  if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('room-banners').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl, path })
}
