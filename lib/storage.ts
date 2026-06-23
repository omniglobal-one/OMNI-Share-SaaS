import { createServiceRoleClient } from '@/lib/supabase/server'

export async function getSignedPhotoUrl(storagePath: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.storage.from('photos').createSignedUrl(storagePath, expiresIn)
  return data?.signedUrl ?? null
}

export async function deletePhoto(storagePath: string): Promise<void> {
  const supabase = createServiceRoleClient()
  await supabase.storage.from('photos').remove([storagePath])
}

export async function deleteBanner(storagePath: string): Promise<void> {
  const supabase = createServiceRoleClient()
  await supabase.storage.from('room-banners').remove([storagePath])
}
