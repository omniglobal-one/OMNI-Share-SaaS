interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function SkeletonTopbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-bg-border bg-bg-card">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonSidebar() {
  return (
    <aside className="w-60 bg-bg-card border-r border-bg-border flex flex-col h-screen">
      <div className="px-4 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="px-4 py-3 border-b border-bg-border">
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex-1 px-3 py-4 space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      <div className="px-4 py-4 border-t border-bg-border space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </aside>
  )
}

function DashboardShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <div className="hidden lg:block shrink-0">
        <SkeletonSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export function RoomsPageSkeleton() {
  return (
    <DashboardShellSkeleton>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShellSkeleton>
  )
}

export function ManagePageSkeleton() {
  return (
    <DashboardShellSkeleton>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        {/* Content block */}
        <div className="card p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-bg-border last:border-0">
              <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShellSkeleton>
  )
}

export function AdminPageSkeleton() {
  return (
    <DashboardShellSkeleton>
      <SkeletonTopbar />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tab bar */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        {/* Table */}
        <div className="card overflow-hidden">
          <div className="border-b border-bg-border px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-bg-border last:border-0">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShellSkeleton>
  )
}

export function ModeratePageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Simple topbar — moderate page has no sidebar */}
      <div className="border-b border-bg-border bg-bg-card px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <Skeleton className="w-32 h-32 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex gap-2 mt-auto">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
