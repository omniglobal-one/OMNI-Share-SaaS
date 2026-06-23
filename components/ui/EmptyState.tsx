import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  cta?: React.ReactNode
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-14 h-14 bg-bg-border rounded-full flex items-center justify-center mb-4 text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-xs">{description}</p>
      )}
      {cta && (
        <div className="mt-4">{cta}</div>
      )}
    </div>
  )
}
