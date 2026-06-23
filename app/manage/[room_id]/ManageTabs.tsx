'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { JoinCodeCard } from '@/components/rooms/JoinCodeCard'
import { Modal } from '@/components/ui/Modal'
import { PhotoLightbox } from '@/components/ui/PhotoLightbox'
import { deletePhoto, moderatePhoto } from '@/app/actions/photos'
import { assignModerator, removeModerator } from '@/app/actions/moderators'
import { updateRoom, archiveRoom, deleteRoom } from '@/app/actions/rooms'
import type { Room, Photo, AuditLog, Role } from '@/types'

interface ManageTabsProps {
  room: Room
  photos: Photo[]
  moderators: Array<{ id: string; moderator_id: string; profiles: unknown }>
  memberCount: number
  auditLogs: AuditLog[]
  userRole: Role
  appUrl: string
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'photos', label: 'Photos' },
  { id: 'moderators', label: 'Moderators' },
  { id: 'settings', label: 'Settings' },
]

type PhotoStatus = 'all' | 'pending' | 'approved' | 'rejected'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export function ManageTabs({ room, photos, moderators, memberCount, auditLogs, userRole, appUrl }: ManageTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState<PhotoStatus>('all')
  const [photoList, setPhotoList] = useState<Photo[]>(photos)
  const [modList, setModList] = useState(moderators)
  const [roomData, setRoomData] = useState(room)

  // Settings form
  const [editName, setEditName] = useState(room.name)
  const [editDesc, setEditDesc] = useState(room.description ?? '')
  const [editMax, setEditMax] = useState(room.max_uploads_per_user)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  async function handleModerate(photoId: string, status: 'approved' | 'rejected') {
    const result = await moderatePhoto(photoId, status)
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
    setSaving(true)
    const result = await updateRoom(room.id, {
      name: editName,
      ...(editDesc ? { description: editDesc } : {}),
      maxUploadsPerUser: editMax,
    })
    setSaving(false)
    if (!result.success) {
      setSaveError(result.error)
    } else {
      setRoomData(prev => ({ ...prev, name: editName, description: editDesc || null, max_uploads_per_user: editMax }))
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
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={roomData.status} />
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
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

            {/* Join code */}
            <JoinCodeCard roomId={room.id} joinCode={room.join_code} appUrl={appUrl} />

            {/* Recent activity */}
            {auditLogs.length > 0 && (
              <div className="card p-4">
                <h3 className="section-title">Recent activity</h3>
                <div className="space-y-2">
                  {auditLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-mono">{log.action}</span>
                      <span className="text-text-tertiary">{formatDate(log.created_at)}</span>
                    </div>
                  ))}
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
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-white'
                      : 'bg-bg-card border border-bg-border text-text-secondary'
                  }`}
                >
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPhotos.map(photo => (
                    <tr key={photo.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openLightbox(photo.id)}
                            className="relative flex-shrink-0 group"
                            title="Click to view full size"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.public_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center">
                              <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </button>
                          <span className="text-text-primary text-xs truncate max-w-[160px]">
                            {photo.file_name ?? photo.id}
                          </span>
                        </div>
                      </td>
                      <td><Badge variant={photo.status} /></td>
                      <td className="text-xs text-text-tertiary">{formatDate(photo.uploaded_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {photo.status !== 'approved' && (
                            <button
                              onClick={() => handleModerate(photo.id, 'approved')}
                              className="btn-success text-xs px-2.5 py-1"
                            >
                              Approve
                            </button>
                          )}
                          {photo.status !== 'rejected' && (
                            <button
                              onClick={() => handleModerate(photo.id, 'rejected')}
                              className="btn-danger text-xs px-2.5 py-1"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-text-tertiary hover:text-danger text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPhotos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-text-tertiary">
                        No photos found
                      </td>
                    </tr>
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
              {modError && (
                <p className="text-danger text-sm mb-2">{modError}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={modUsername}
                  onChange={e => setModUsername(e.target.value)}
                  placeholder="Username"
                />
                <button type="submit" className="btn-primary" disabled={addingMod}>
                  {addingMod ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>

            <div className="card overflow-hidden">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Moderator</th>
                    <th>Assigned</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {modList.map(mod => {
                    const p = getProfile(mod)
                    return (
                      <tr key={mod.id}>
                        <td className="font-medium text-text-primary">
                          {p?.full_name ?? p?.username ?? mod.moderator_id}
                        </td>
                        <td className="text-xs text-text-tertiary">-</td>
                        <td>
                          <button
                            onClick={() => handleRemoveModerator(mod.moderator_id)}
                            className="text-danger hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {modList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-text-tertiary">No moderators assigned</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="section-header">Room settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {saveError && (
                  <p className="text-danger text-sm">{saveError}</p>
                )}
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
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

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
                    <button onClick={() => setShowArchiveConfirm(true)} className="btn-secondary text-sm">Archive</button>
                  </div>
                )}
                {userRole === 'admin' && (
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-danger text-sm">Delete room</p>
                      <p className="text-text-secondary text-xs">Permanently deletes everything. Cannot be undone.</p>
                    </div>
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onModerate={handleModerate}
          onDelete={handleDeletePhoto}
        />
      )}

      {/* Archive confirm */}
      <Modal open={showArchiveConfirm} onClose={() => setShowArchiveConfirm(false)} title="Archive room?" size="sm">
        <p className="text-text-secondary text-sm mb-4">
          New uploads will be disabled. The wall will still be viewable. This can be undone from settings.
        </p>
        <div className="flex gap-2">
          <button onClick={handleArchive} className="btn-danger flex-1" disabled={archiving}>
            {archiving ? 'Archiving...' : 'Archive room'}
          </button>
          <button onClick={() => setShowArchiveConfirm(false)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete room?" size="sm">
        <p className="text-text-secondary text-sm mb-3">
          This is permanent. Type <strong className="font-mono text-danger">{room.name}</strong> to confirm.
        </p>
        <input
          type="text"
          className="input mb-4"
          value={deleteConfirmName}
          onChange={e => setDeleteConfirmName(e.target.value)}
          placeholder={room.name}
        />
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="btn-danger flex-1"
            disabled={deleting || deleteConfirmName !== room.name}
          >
            {deleting ? 'Deleting...' : 'Delete permanently'}
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
