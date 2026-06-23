'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import type { Room, Role } from '@/types'

interface RoomCardProps {
  room: Room
  role: Role
  memberRole?: 'owner' | 'moderator' | 'member'
}

export function RoomCard({ room, role, memberRole }: RoomCardProps) {
  const isManagerOrAdmin = role === 'admin' || role === 'manager'
  const href = isManagerOrAdmin ? `/manage/${room.id}` : `/room/${room.id}`

  const roleLabel = memberRole === 'owner' ? 'Owner'
    : memberRole === 'moderator' ? 'Moderator'
    : 'Member'

  return (
    <Link href={href} className="card block overflow-hidden hover:shadow-md transition-shadow group">
      {/* Banner */}
      <div className="h-36 bg-primary/10 relative overflow-hidden">
        {room.banner_url ? (
          <Image
            src={room.banner_url}
            alt={room.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={room.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary">{room.name}</h3>
          {memberRole && (
            <span className="text-xs text-text-tertiary flex-shrink-0">{roleLabel}</span>
          )}
        </div>
        {room.description && (
          <p className="text-text-secondary text-sm mt-1 line-clamp-2">{room.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
          <span>{room.upload_count} upload{room.upload_count !== 1 ? 's' : ''}</span>
          <span>{room.approved_count} approved</span>
          <span className="font-mono text-text-tertiary/80">{room.join_code}</span>
        </div>
      </div>
    </Link>
  )
}
