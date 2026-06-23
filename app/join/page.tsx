import { Suspense } from 'react'
import { JoinClient } from './JoinClient'

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JoinClient />
    </Suspense>
  )
}
