'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { changeRole, suspendUser, unsuspendUser, deleteUser, createUser } from '@/app/actions/users'
import { archiveRoom, deleteRoom } from '@/app/actions/rooms'
import type { Profile, Room, AuditLog, Role } from '@/types'

interface AdminTabsProps {
  users: Profile[]
  rooms: Room[]
  auditLogs: AuditLog[]
  currentUserId: string
}

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'audit', label: 'Audit Log' },
]

const ROLES: Role[] = ['user', 'moderator', 'manager', 'admin']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AdminTabs({ users: initialUsers, rooms: initialRooms, auditLogs, currentUserId }: AdminTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [userList, setUserList] = useState<Profile[]>(initialUsers)
  const [roomList, setRoomList] = useState<Room[]>(initialRooms)
  const [search, setSearch] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  // Create user modal
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('user')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreating(true)
    const result = await createUser(newEmail, newPass, newName, newRole)
    setCreating(false)
    if (!result.success) {
      setCreateError(result.error)
    } else {
      setShowCreate(false)
      router.refresh()
    }
  }

  async function handleChangeRole(userId: string, role: Role) {
    const result = await changeRole(userId, role)
    if (result.success) {
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    }
  }

  async function handleSuspend(userId: string) {
    const result = await suspendUser(userId)
    if (result.success) {
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
    }
  }

  async function handleUnsuspend(userId: string) {
    const result = await unsuspendUser(userId)
    if (result.success) {
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    const result = await deleteUser(userId)
    if (result.success) {
      setUserList(prev => prev.filter(u => u.id !== userId))
    }
  }

  async function handleArchiveRoom(roomId: string) {
    const result = await archiveRoom(roomId)
    if (result.success) {
      setRoomList(prev => prev.map(r => r.id === roomId ? { ...r, status: 'archived' } : r))
    }
  }

  async function handleDeleteRoom(roomId: string, roomName: string) {
    const input = window.prompt(`Type "${roomName}" to confirm deletion:`)
    if (input !== roomName) return
    const result = await deleteRoom(roomId)
    if (result.success) {
      setRoomList(prev => prev.filter(r => r.id !== roomId))
    }
  }

  const filteredUsers = search
    ? userList.filter(u =>
        (u.full_name?.toLowerCase().includes(search.toLowerCase())) ||
        (u.username?.toLowerCase().includes(search.toLowerCase()))
      )
    : userList

  const activeRooms = userList.filter(u => !u.is_suspended).length
  const totalPhotos = roomList.reduce((acc, r) => acc + r.upload_count, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: userList.length },
          { label: 'Active Users', value: activeRooms },
          { label: 'Total Rooms', value: roomList.length },
          { label: 'Total Uploads', value: totalPhotos },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-text-tertiary text-sm font-medium mb-3">{s.label}</p>
            <p className="text-2xl font-semibold text-text-primary font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'users' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create user
          </button>
        )}
      </div>

      <div className="mt-6">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <input
              type="search"
              className="input max-w-sm"
              placeholder="Search by name or username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="card overflow-hidden">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar avatarUrl={u.avatar_url} fullName={u.full_name} size="sm" />
                          <div>
                            <p className="text-text-primary font-medium text-sm">{u.full_name ?? 'Unknown'}</p>
                            {u.username && <p className="text-text-tertiary text-xs">@{u.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="input py-1 text-xs w-28"
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value as Role)}
                          disabled={u.id === currentUserId}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`text-xs font-medium ${u.is_suspended ? 'text-danger' : 'text-success'}`}>
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="text-xs">{formatDate(u.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {u.id !== currentUserId && (
                            <>
                              {u.is_suspended ? (
                                <button onClick={() => handleUnsuspend(u.id)} className="text-success text-xs hover:underline">Unsuspend</button>
                              ) : (
                                <button onClick={() => handleSuspend(u.id)} className="text-amber-600 text-xs hover:underline">Suspend</button>
                              )}
                              <button onClick={() => handleDeleteUser(u.id)} className="text-danger text-xs hover:underline">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROOMS TAB */}
        {activeTab === 'rooms' && (
          <div className="card overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Uploads</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomList.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium text-text-primary">{r.name}</td>
                    <td className="font-mono text-xs">{r.join_code}</td>
                    <td><Badge variant={r.status} /></td>
                    <td className="text-xs">{r.upload_count}</td>
                    <td className="text-xs">{formatDate(r.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {r.status === 'active' && (
                          <button onClick={() => handleArchiveRoom(r.id)} className="text-amber-600 text-xs hover:underline">Archive</button>
                        )}
                        <button onClick={() => handleDeleteRoom(r.id, r.name)} className="text-danger text-xs hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="card overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Date</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs">{log.action}</td>
                    <td className="text-xs">{log.target_type ?? '-'}</td>
                    <td className="text-xs">{formatDate(log.created_at)}</td>
                    <td>
                      {log.metadata && (
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="text-primary text-xs hover:underline"
                        >
                          {expandedLog === log.id ? 'Hide' : 'Show'}
                        </button>
                      )}
                      {expandedLog === log.id && (
                        <pre className="text-xs bg-bg-base p-2 rounded mt-1 max-w-xs overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-text-tertiary">No audit logs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create user">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createError && <p className="text-danger text-sm">{createError}</p>}
          <div>
            <label className="label">Full name</label>
            <input type="text" className="input" value={newName} onChange={e => setNewName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={newPass} onChange={e => setNewPass(e.target.value)} minLength={8} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creating}>
              {creating ? 'Creating...' : 'Create user'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
