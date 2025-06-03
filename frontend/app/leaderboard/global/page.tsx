'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GlobalRankingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/leaderboard')
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
} 