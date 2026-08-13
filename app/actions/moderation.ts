'use server'
import { moderatePhoto } from './photos'
import type { ActionResult } from '@/types'

// Thin wrappers around the single, correctly-scoped moderation implementation in photos.ts.
// This file used to duplicate the whole permission check and DB write, which had drifted out
// of sync with photos.ts (managers could moderate rooms they had no relationship to, unlike
// every other room-management action in the app). Kept as separate exports because
// components/moderation/ModerationPanel.tsx (the dedicated moderation-queue page) calls these
// by name; app/manage/[room_id]/ManageTabs.tsx calls moderatePhoto directly.
export async function approvePhoto(photoId: string, _roomId: string): Promise<ActionResult> {
  return moderatePhoto(photoId, 'approved')
}

export async function rejectPhoto(photoId: string, _roomId: string, reason?: string): Promise<ActionResult> {
  return moderatePhoto(photoId, 'rejected', reason)
}
