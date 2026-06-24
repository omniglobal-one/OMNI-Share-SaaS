'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { JoinCodeCard } from '@/components/rooms/JoinCodeCard'
import { Modal } from '@/components/ui/Modal'
import { PhotoLightbox } from '@/components/ui/PhotoLightbox'
import { SocialLinkEditor } from '@/components/ui/SocialLinkEditor'
import { deletePhoto, moderatePhoto } from '@/app/actions/photos'
import { assignModerator, removeModerator } from '@/app/actions/moderators'
import { updateRoom, archiveRoom, deleteRoom } from '@/app/actions/rooms'
import type { Room, Photo, AuditLog, Role, SocialLink, WallColors } from '@/types'

interface ManageTabsProps {
  room: Room
  photos: (Photo & { moderator?: { id: string; full_name: string | null } | null })[]
  moderators: Array<{ id: string; moderator_id: string; profiles: unknown }>
  memberCount: number
  auditLogs: AuditLog[]
  actorMap: Record<string, string>
  userRole: Role
  appUrl: string
  activeTab: 'overview' | 'photos' | 'moderators' | 'settings'
}

type PhotoStatus = 'all' | 'pending' | 'approved' | 'rejected'

const DEFAULT_COLORS: WallColors = { bg: '#000000', text: '#FFFFFF', accent: '#2563EB' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

interface ActivityEntry {
  icon: 'photo-check' | 'photo-x' | 'join' | 'settings' | 'archive' | 'upload' | 'default'
  text: string
  detail?: string | undefined
  actor?: string | undefined
}

function describeActivity(log: AuditLog, actorMap: Record<string, string>): ActivityEntry {
  const meta = (log.metadata ?? {}) as Record<string, string>
  const actor = actorMap[log.actor_id]

  switch (log.action) {
    case 'room.update':
      return { icon: 'settings', text: 'Room settings updated', actor }
    case 'room.create':
    case 'room_created':
      return { icon: 'default', text: 'Room created', detail: meta.room_name, actor }
    case 'room.archive':
    case 'room_archived':
      return { icon: 'archive', text: 'Room archived', actor }
    case 'room.regenerate_code':
      return { icon: 'settings', text: 'Join code regenerated', actor }
    case 'room.join':
    case 'room_joined': {
      const who = meta.username ? `@${meta.username}` : actor ?? 'Guest'
      return { icon: 'join', text: `${who} joined`, detail: meta.join_code ? `code: ${meta.join_code}` : undefined }
    }
    case 'photo.approved':
    case 'photo_approved':
      return {
        icon: 'photo-check',
        text: 'Photo approved',
        detail: meta.uploader ? `uploaded by @${meta.uploader}` : undefined,
        actor,
      }
    case 'photo.rejected':
    case 'photo_rejected':
      return {
        icon: 'photo-x',
        text: 'Photo rejected',
        detail: [
          meta.uploader ? `uploaded by @${meta.uploader}` : null,
          meta.reason ? `"${meta.reason}"` : null,
        ].filter(Boolean).join(' · ') || undefined,
        actor,
      }
    case 'photo.delete':
    case 'photo_deleted':
      return { icon: 'photo-x', text: 'Photo deleted', actor }
    case 'photo.upload':
    case 'photo_uploaded':
      return { icon: 'upload', text: 'Photo uploaded', actor: meta.uploader ? `@${meta.uploader}` : actor }
    default:
      return { icon: 'default', text: log.action.replace(/[._]/g, ' '), actor }
  }
}

const activityIcons: Record<ActivityEntry['icon'], React.ReactNode> = {
  'photo-check': (
    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  'photo-x': (
    <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  join: (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    </div>
  ),
  settings: (
    <div className="w-8 h-8 rounded-full bg-bg-border flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  ),
  archive: (
    <div className="w-8 h-8 rounded-full bg-bg-border flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    </div>
  ),
  upload: (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    </div>
  ),
  default: (
    <div className="w-8 h-8 rounded-full bg-bg-border flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
}

function getProfile(mod: { profiles: unknown }): { full_name: string | null; username: string | null } | null {
  if (mod.profiles && typeof mod.profiles === 'object') {
    const p = mod.profiles as Record<string, unknown>
    return {
      full_name: typeof p['full_name'] === 'string' ? p['full_name'] : null,
      username: typeof p['username'] === 'string' ? p['username'] : null,
    }
  }
  return null
}

export function ManageTabs({ room, photos, moderators, memberCount, auditLogs, actorMap, userRole, appUrl, activeTab }: ManageTabsProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<PhotoStatus>('all')
  const [photoList, setPhotoList] = useState(photos)
  const [modList, setModList] = useState(moderators)
  const [roomData, setRoomData] = useState(room)

  // Settings form
  const [editName, setEditName] = useState(room.name)
  const [editDesc, setEditDesc] = useState(room.description ?? '')
  const [editMax, setEditMax] = useState(room.max_uploads_per_user)
  const [wallColors, setWallColors] = useState<WallColors>(room.wall_colors ?? DEFAULT_COLORS)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(room.social_links ?? [])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Moderator add
  const [modUsername, setModUsername] = useState('')
  const [addingMod, setAddingMod] = useState(false)
  const [modError, setModError] = useState<string | null>(null)

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Archive/delete
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filteredPhotos = statusFilter === 'all' ? photoList : photoList.filter(p => p.status === statusFilter)

  const stats = {
    total: photoList.length,
    approved: photoList.filter(p => p.status === 'approved').length,
    pending: photoList.filter(p => p.status === 'pending').length,
    rejected: photoList.filter(p => p.status === 'rejected').length,
  }

  // Rejection reason modal
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  function openRejectModal(photoId: string) {
    setRejectTarget(photoId)
    setRejectReason('')
  }

  async function confirmReject() {
    if (!rejectTarget) return
    setRejecting(true)
    const result = await moderatePhoto(rejectTarget, 'rejected', rejectReason.trim() || undefined)
    setRejecting(false)
    if (result.success) {
      setPhotoList(prev => prev.map(p => p.id === rejectTarget ? { ...p, status: 'rejected' } : p))
      setRejectTarget(null)
    }
  }

  async function handleModerate(photoId: string, status: 'approved' | 'rejected', reason?: string) {
    if (status === 'rejected' && reason === undefined) {
      openRejectModal(photoId)
      return
    }
    const result = await moderatePhoto(photoId, status, reason)
    if (result.success) {
      setPhotoList(prev => prev.map(p => p.id === photoId ? { ...p, status } : p))
    }
  }

  async function handleDeletePhoto(photoId: string) {
    const result = await deletePhoto(photoId)
    if (result.success) {
      setPhotoList(prev => prev.filter(p => p.id !== photoId))
    }
  }

  function openLightbox(photoId: string) {
    const idx = filteredPhotos.findIndex(p => p.id === photoId)
    if (idx !== -1) setLightboxIndex(idx)
  }

  async function handleAddModerator(e: React.FormEvent) {
    e.preventDefault()
    if (!modUsername.trim()) return
    setModError(null)
    setAddingMod(true)
    const result = await assignModerator(room.id, modUsername.trim())
    setAddingMod(false)
    if (!result.success) {
      setModError(result.error)
    } else {
      setModUsername('')
      router.refresh()
    }
  }

  async function handleRemoveModerator(moderatorId: string) {
    const result = await removeModerator(room.id, moderatorId)
    if (result.success) {
      setModList(prev => prev.filter(m => m.moderator_id !== moderatorId))
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    setSaving(true)
    const result = await updateRoom(room.id, {
      name: editName,
      ...(editDesc ? { description: editDesc } : {}),
      maxUploadsPerUser: editMax,
      wallColors,
      socialLinks,
    })
    setSaving(false)
    if (!result.success) {
      setSaveError(result.error)
    } else {
      setSaveSuccess(true)
      setRoomData(prev => ({ ...prev, name: editName, description: editDesc || null, max_uploads_per_user: editMax, wall_colors: wallColors, social_links: socialLinks }))
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    await archiveRoom(room.id)
    setArchiving(false)
    setShowArchiveConfirm(false)
    setRoomData(prev => ({ ...prev, status: 'archived' }))
  }

  async function handleDelete() {
    if (deleteConfirmName !== room.name) return
    setDeleting(true)
    const result = await deleteRoom(room.id)
    setDeleting(false)
    if (result.success) {
      router.push('/rooms')
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total uploads', value: stats.total },
                { label: 'Approved', value: stats.approved },
                { label: 'Pending', value: stats.pending },
                { label: 'Members', value: memberCount },
              ].map(s => (
                <div key={s.label} className="stat-card text-center">
                  <p className="text-2xl font-semibold text-text-primary font-mono">{s.value}</p>
                  <p className="text-sm text-text-tertiary mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <JoinCodeCard roomId={room.id} joinCode={room.join_code} appUrl={appUrl} roomId2={room.id} />

            {auditLogs.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-bg-border">
                  <h3 className="font-semibold text-text-primary text-sm">Recent activity</h3>
                </div>
                <div className="divide-y divide-bg-border/50">
                  {auditLogs.slice(0, 15).map(log => {
                    const entry = describeActivity(log, actorMap)
                    return (
                      <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                        {activityIcons[entry.icon]}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary font-medium">{entry.text}</p>
                          {entry.detail && (
                            <p className="text-xs text-text-tertiary mt-0.5 truncate">{entry.detail}</p>
                          )}
                          {entry.actor && (
                            <p className="text-xs text-text-tertiary mt-0.5">by {entry.actor}</p>
                          )}
                        </div>
                        <span className="text-xs text-text-tertiary whitespace-nowrap flex-shrink-0 pt-0.5">
                          {relativeTime(log.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected'] as PhotoStatus[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    statusFilter === s ? 'bg-primary text-white' : 'bg-bg-card border border-bg-border text-text-secondary'
                  }`}>
                  {s} {s === 'all' ? `(${stats.total})` : s === 'pending' ? `(${stats.pending})` : s === 'approved' ? `(${stats.approved})` : `(${stats.rejected})`}
                </button>
              ))}
            </div>

            <div className="card overflow-hidden">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Moderated by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPhotos.map(photo => (
                    <tr key={photo.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <button onClick={() => openLightbox(photo.id)} className="relative flex-shrink-0 group" title="Click to view full size">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.public_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center">
                              <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </button>
                          <span className="text-text-primary text-xs truncate max-w-[140px]">{photo.file_name ?? photo.id}</span>
                        </div>
                      </td>
                      <td><Badge variant={photo.status} /></td>
                      <td className="text-xs text-text-tertiary">{formatDate(photo.uploaded_at)}</td>
                      <td className="text-xs text-text-secondary">
                        {photo.moderator?.full_name ?? (photo.moderated_by ? '—' : <span className="text-text-tertiary">Not yet</span>)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {photo.status !== 'approved' && (
                            <button onClick={() => handleModerate(photo.id, 'approved')} className="btn-success text-xs px-2.5 py-1">Approve</button>
                          )}
                          {photo.status !== 'rejected' && (
                            <button onClick={() => handleModerate(photo.id, 'rejected')} className="btn-danger text-xs px-2.5 py-1">Reject</button>
                          )}
                          <button onClick={() => handleDeletePhoto(photo.id)} className="text-text-tertiary hover:text-danger text-xs transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPhotos.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-text-tertiary">No photos found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODERATORS TAB */}
        {activeTab === 'moderators' && (
          <div className="space-y-4">
            <form onSubmit={handleAddModerator} className="card p-4">
              <h3 className="section-title">Add moderator</h3>
              {modError && <p className="text-danger text-sm mb-2">{modError}</p>}
              <div className="flex gap-2">
                <input type="text" className="input flex-1" value={modUsername} onChange={e => setModUsername(e.target.value)} placeholder="Username" />
                <button type="submit" className="btn-primary" disabled={addingMod}>{addingMod ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
            <div className="card overflow-hidden">
              <table className="table-base">
                <thead><tr><th>Moderator</th><th>Assigned</th><th></th></tr></thead>
                <tbody>
                  {modList.map(mod => {
                    const p = getProfile(mod)
                    return (
                      <tr key={mod.id}>
                        <td className="font-medium text-text-primary">{p?.full_name ?? p?.username ?? mod.moderator_id}</td>
                        <td className="text-xs text-text-tertiary">—</td>
                        <td><button onClick={() => handleRemoveModerator(mod.moderator_id)} className="text-danger hover:text-red-700 text-xs">Remove</button></td>
                      </tr>
                    )
                  })}
                  {modList.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-8 text-text-tertiary">No moderators assigned</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Room details */}
            <div className="card p-6 space-y-4">
              <h3 className="section-header">Room details</h3>
              {saveError && <p className="text-danger text-sm">{saveError}</p>}
              {saveSuccess && <p className="text-success text-sm">Changes saved.</p>}
              <div>
                <label className="label">Room name</label>
                <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
              </div>
              <div>
                <label className="label">Max uploads per user</label>
                <input type="number" className="input" value={editMax} onChange={e => setEditMax(parseInt(e.target.value, 10) || 50)} min={1} max={1000} />
              </div>
            </div>

            {/* Wall colors */}
            <div className="card p-6 space-y-4">
              <h3 className="section-header">Wall colors</h3>
              <p className="text-text-secondary text-sm">Customize the look of your public photo wall and slideshow.</p>
              <div className="grid grid-cols-3 gap-4">
                {([
                  { key: 'bg', label: 'Background' },
                  { key: 'text', label: 'Text' },
                  { key: 'accent', label: 'Accent' },
                ] as { key: keyof WallColors; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={wallColors[key]}
                        onChange={e => setWallColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-10 h-10 rounded-lg border border-bg-border cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={wallColors[key]}
                        onChange={e => setWallColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="input font-mono text-sm flex-1"
                        maxLength={7}
                        pattern="#[0-9A-Fa-f]{6}"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Preview strip */}
              <div className="rounded-xl overflow-hidden border border-bg-border h-16 flex items-center justify-between px-5"
                style={{ background: wallColors.bg }}>
                <span className="font-bold text-base" style={{ color: wallColors.text }}>{roomData.name}</span>
                <span className="text-sm font-mono tracking-widest" style={{ color: wallColors.accent }}>{room.join_code}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="card p-6 space-y-4">
              <h3 className="section-header">Social media links</h3>
              <p className="text-text-secondary text-sm">Add links shown on the public wall (event page, socials, hashtags, etc.).</p>
              <SocialLinkEditor links={socialLinks} onChange={setSocialLinks} />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save all changes'}
            </button>

            {/* Danger zone */}
            <div className="card p-6 border-danger/30">
              <h3 className="section-header text-danger">Danger zone</h3>
              <div className="space-y-3">
                {roomData.status === 'active' && (
                  <div className="flex items-center justify-between py-3 border-b border-bg-border">
                    <div>
                      <p className="font-medium text-text-primary text-sm">Archive room</p>
                      <p className="text-text-secondary text-xs">Stops new uploads. Wall still viewable.</p>
                    </div>
                    <button type="button" onClick={() => setShowArchiveConfirm(true)} className="btn-secondary text-sm">Archive</button>
                  </div>
                )}
                {userRole === 'admin' && (
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-danger text-sm">Delete room</p>
                      <p className="text-text-secondary text-xs">Permanently deletes everything. Cannot be undone.</p>
                    </div>
                    <button type="button" onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <Modal open={rejectTarget !== null} onClose={() => setRejectTarget(null)} title="Reject photo" size="sm">
        <p className="text-text-secondary text-sm mb-3">Select a reason or write your own.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            'Blurry or low quality',
            'Inappropriate content',
            'Off topic',
            'Duplicate photo',
            'Wrong event',
            'Poor lighting',
          ].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setRejectReason(preset)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                rejectReason === preset
                  ? 'bg-danger/10 border-danger text-danger font-medium'
                  : 'border-bg-border text-text-secondary hover:border-text-tertiary hover:text-text-primary'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <textarea
          className="input resize-none mb-4"
          rows={2}
          placeholder="Or type a custom reason…"
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          maxLength={200}
        />
        <div className="flex gap-2">
          <button onClick={confirmReject} className="btn-danger flex-1" disabled={rejecting}>
            {rejecting ? 'Rejecting…' : 'Reject photo'}
          </button>
          <button onClick={() => setRejectTarget(null)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onModerate={handleModerate}
          onDelete={handleDeletePhoto}
        />
      )}

      <Modal open={showArchiveConfirm} onClose={() => setShowArchiveConfirm(false)} title="Archive room?" size="sm">
        <p className="text-text-secondary text-sm mb-4">New uploads will be disabled. The wall will still be viewable.</p>
        <div className="flex gap-2">
          <button onClick={handleArchive} className="btn-danger flex-1" disabled={archiving}>{archiving ? 'Archiving...' : 'Archive room'}</button>
          <button onClick={() => setShowArchiveConfirm(false)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete room?" size="sm">
        <p className="text-text-secondary text-sm mb-3">
          This is permanent. Type <strong className="font-mono text-danger">{room.name}</strong> to confirm.
        </p>
        <input type="text" className="input mb-4" value={deleteConfirmName} onChange={e => setDeleteConfirmName(e.target.value)} placeholder={room.name} />
        <div className="flex gap-2">
          <button onClick={handleDelete} className="btn-danger flex-1" disabled={deleting || deleteConfirmName !== room.name}>
            {deleting ? 'Deleting...' : 'Delete permanently'}
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
