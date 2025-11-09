'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin/home')
      } else {
        router.push('/user')
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}
