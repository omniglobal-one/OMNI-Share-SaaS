export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="bg-bg-border rounded-lg h-40 mb-3" />
      <div className="bg-bg-border rounded h-4 mb-2 w-3/4" />
      <div className="bg-bg-border rounded h-3 w-1/2" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 animate-pulse border-b border-bg-border">
      <div className="bg-bg-border rounded-full w-9 h-9 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="bg-bg-border rounded h-3 w-1/3" />
        <div className="bg-bg-border rounded h-3 w-1/4" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
