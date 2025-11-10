'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

export default function HomePage() {
  const router = useRouter()
  const { user, _hasHydrated, setHasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

 
  useEffect(() => {
    setMounted(true)
    
    if (!_hasHydrated) {
      const timer = setTimeout(() => {
        setHasHydrated(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [_hasHydrated, setHasHydrated])

  useEffect(() => {
    if (!mounted || !_hasHydrated) {
      return
    }

    if (user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/home')
      } else {
        router.replace('/user')
      }
    } else {
      router.replace('/login')
    }
  }, [user, router, mounted, _hasHydrated])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}
