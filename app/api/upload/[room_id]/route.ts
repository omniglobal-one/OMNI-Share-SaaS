import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF....WEBP
  { mime: 'image/heic', bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // ....ftyp
]

function detectMimeFromBytes(buf: Uint8Array): string | null {
  for (const sig of MAGIC_BYTES) {
    const off = sig.offset ?? 0
    if (buf.length < off + sig.bytes.length) continue
    if (sig.bytes.every((b, i) => buf[off + i] === b)) return sig.mime
  }
  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ room_id: string }> }
) {
  const { room_id } = await params

  // Auth check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_suspended')
    .eq('id', user.id)
    .single()

  if (profile?.is_suspended) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
  }

  const admin = createServiceRoleClient()
  const roomId = room_id

  // Check membership
  const { data: member } = await admin
    .from('room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 })
  }

  // Check room status
  const { data: room } = await admin.from('rooms').select('status, max_uploads_per_user').eq('id', roomId).single()
  if (!room || room.status === 'archived') {
    return NextResponse.json({ error: 'Room not available' }, { status: 403 })
  }

  // Check upload count for this user in this room
  const { count } = await admin
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('uploader_id', user.id)

  if (count !== null && count >= room.max_uploads_per_user) {
    return NextResponse.json({ error: `Upload limit reached (${room.max_uploads_per_user} photos per user)` }, { status: 429 })
  }

  // Parse form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file size before reading content
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  // Read buffer and validate by magic bytes — never trust client-supplied MIME type
  const buffer = await file.arrayBuffer()
  const detectedMime = detectMimeFromBytes(new Uint8Array(buffer))
  if (!detectedMime || !ALLOWED_TYPES.includes(detectedMime)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const widthStr = formData.get('width')
  const heightStr = formData.get('height')
  const width = widthStr ? parseInt(String(widthStr), 10) : null
  const height = heightStr ? parseInt(String(heightStr), 10) : null

  // Generate photo ID and storage path — use detected MIME, not client-supplied
  const photoId = crypto.randomUUID()
  const ext = detectedMime === 'image/jpeg' ? 'jpg'
    : detectedMime === 'image/png' ? 'png'
    : detectedMime === 'image/webp' ? 'webp'
    : 'heic'
  const storagePath = `rooms/${roomId}/${photoId}.${ext}`
  const { error: uploadError } = await admin.storage
    .from('photos')
    .upload(storagePath, buffer, {
      contentType: detectedMime,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Get public URL (signed, since bucket is private)
  const { data: signedData } = await admin.storage.from('photos').createSignedUrl(storagePath, 60 * 60 * 24 * 365)
  const publicUrl = signedData?.signedUrl ?? storagePath

  // Insert photo row
  const insertData: Record<string, unknown> = {
    id: photoId,
    room_id: roomId,
    uploader_id: user.id,
    storage_path: storagePath,
    public_url: publicUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: detectedMime,
    status: 'pending',
  }
  if (width !== null && !isNaN(width)) insertData['width'] = width
  if (height !== null && !isNaN(height)) insertData['height'] = height

  const { data: photo, error: insertError } = await admin
    .from('photos')
    .insert(insertData)
    .select()
    .single()

  if (insertError) {
    await admin.storage.from('photos').remove([storagePath])
    return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
  }

  // Increment upload_count on room (best-effort via RPC or raw SQL increment)
  await Promise.resolve(admin.rpc('increment_upload_count', { room_id_param: roomId })).catch(() => {
    // RPC may not exist; ignore — count will be stale until next query
  })

  return NextResponse.json({ photo })
}
