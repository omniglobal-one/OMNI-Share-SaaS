export type Role = 'admin' | 'manager' | 'moderator' | 'user'
export type PhotoStatus = 'pending' | 'approved' | 'rejected'
export type RoomStatus = 'active' | 'archived'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  username: string | null
  avatar_url: string | null
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  description: string | null
  join_code: string
  banner_url: string | null
  status: RoomStatus
  owner_id: string
  created_by: string
  upload_count: number
  approved_count: number
  max_uploads_per_user: number
  created_at: string
  updated_at: string
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  joined_at: string
}

export interface RoomModerator {
  id: string
  room_id: string
  moderator_id: string
  assigned_by: string
  assigned_at: string
}

export interface Photo {
  id: string
  room_id: string
  uploader_id: string
  storage_path: string
  public_url: string
  thumbnail_url: string | null
  file_name: string | null
  file_size: number | null
  width: number | null
  height: number | null
  mime_type: string | null
  status: PhotoStatus
  moderated_by: string | null
  moderated_at: string | null
  rejection_reason: string | null
  uploaded_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface UploadFile {
  file: File
  previewUrl: string
  width: number
  height: number
  error?: string
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
