import Image from 'next/image'

type Size = 'sm' | 'md' | 'lg'

interface AvatarProps {
  avatarUrl?: string | null
  fullName?: string | null
  size?: Size
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

const pixelSizes: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 48,
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

export function Avatar({ avatarUrl, fullName, size = 'md' }: AvatarProps) {
  const px = pixelSizes[size]
  if (avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
        <Image
          src={avatarUrl}
          alt={fullName ?? 'Avatar'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0`}>
      {getInitials(fullName)}
    </div>
  )
}
