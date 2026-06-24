'use client'
import { useState } from 'react'
import type { SocialLink } from '@/types'

const PLATFORMS = [
  'Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube',
  'WhatsApp', 'Snapchat', 'Telegram',
  'LinkedIn', 'GitHub', 'Reddit', 'Medium',
  'Twitch', 'Discord', 'Pinterest',
  'Google Reviews', 'Website', 'Email', 'Other',
]

interface SocialLinkEditorProps {
  links: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

export function SocialLinkEditor({ links, onChange }: SocialLinkEditorProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newLink, setNewLink] = useState<Omit<SocialLink, 'display_order'>>({
    platform: PLATFORMS[0] ?? 'Other',
    label: '',
    url: '',
  })

  function addLink() {
    if (links.length >= 20) return
    const trimmedUrl = newLink.url.trim()
    const trimmedLabel = newLink.label.trim()
    if (!trimmedUrl || !trimmedLabel) return
    if (!/^https?:\/\//i.test(trimmedUrl)) return
    onChange([...links, { ...newLink, url: trimmedUrl, label: trimmedLabel, display_order: links.length }])
    setNewLink({ platform: PLATFORMS[0] ?? 'Other', label: '', url: '' })
    setShowAdd(false)
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index).map((l, i) => ({ ...l, display_order: i })))
  }

  function moveLink(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= links.length) return
    const updated = [...links]
    const a = updated[index]!
    const b = updated[target]!
    updated[index] = { ...b, display_order: index }
    updated[target] = { ...a, display_order: target }
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-3">
      {links.length > 0 && (
        <div className="card overflow-hidden divide-y divide-bg-border">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{link.label}</p>
                <p className="text-xs text-text-tertiary truncate">{link.platform} · {link.url}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => moveLink(index, -1)} disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-bg-border disabled:opacity-30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" onClick={() => moveLink(index, 1)} disabled={index === links.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-bg-border disabled:opacity-30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button type="button" onClick={() => removeLink(index)}
                  className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors ml-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {links.length === 0 && !showAdd && (
        <p className="text-xs text-text-tertiary">No links added yet.</p>
      )}

      {links.length < 20 && (
        showAdd ? (
          <div className="card p-4 flex flex-col gap-3">
            <select value={newLink.platform} onChange={e => setNewLink(f => ({ ...f, platform: e.target.value }))} className="input text-sm">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" placeholder="Label (e.g. Event Page)" value={newLink.label}
              onChange={e => setNewLink(f => ({ ...f, label: e.target.value }))} className="input text-sm" maxLength={50} />
            <input type="url" placeholder="https://…" value={newLink.url}
              onChange={e => setNewLink(f => ({ ...f, url: e.target.value }))} className="input text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={addLink} className="btn-primary text-sm">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowAdd(true)} className="btn-secondary text-sm w-full justify-center">
            + Add Link
          </button>
        )
      )}
    </div>
  )
}
