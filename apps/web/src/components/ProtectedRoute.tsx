'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'USER'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }

    if (requiredRole && user.role !== requiredRole) {
      // Redirect based on actual role
      if (user.role === 'ADMIN') {
        router.push('/admin/home')
      } else {
        router.push('/user')
      }
    }
  }, [user, token, router, requiredRole])

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

