type Variant = 'pending' | 'approved' | 'rejected' | 'active' | 'archived'

function getClass(variant: Variant): string {
  if (variant === 'pending') return 'badge-pending'
  if (variant === 'approved') return 'badge-approved'
  if (variant === 'rejected') return 'badge-rejected'
  if (variant === 'active') return 'badge-active'
  return 'badge-archived'
}

function getLabel(variant: Variant): string {
  if (variant === 'pending') return 'Pending'
  if (variant === 'approved') return 'Approved'
  if (variant === 'rejected') return 'Rejected'
  if (variant === 'active') return 'Active'
  return 'Archived'
}

export function Badge({ variant }: { variant: Variant }) {
  return (
    <span className={getClass(variant)}>
      {getLabel(variant)}
    </span>
  )
}
