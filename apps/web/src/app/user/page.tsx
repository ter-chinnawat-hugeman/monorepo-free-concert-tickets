'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { concertApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth-store'
import toast from 'react-hot-toast'
import { UserSidebar } from '@/components/Sidebar'

export default function UserPage() {
  const { user, switchRole } = useAuthStore()
  const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: concerts, isLoading } = useQuery({
    queryKey: ['concerts', user?.id],
    queryFn: () => concertApi.getAll(),
  })

  const reserveMutation = useMutation({
    mutationFn: (concertId: string) =>
      concertApi.reserve(concertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerts'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Seat reserved successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to reserve seat')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (concertId: string) =>
      concertApi.cancel(concertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerts'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Reservation cancelled successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel reservation')
    },
  })

  const handleReserve = (concertId: string) => {
    reserveMutation.mutate(concertId)
  }

  const handleCancel = (concertId: string) => {
    cancelMutation.mutate(concertId)
  }

  return (
    <div className="flex min-h-screen bg-gray-700">
      <UserSidebar currentPath="/user" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 bg-white p-4 md:p-8">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden mb-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">User</h1>
        </div>

        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading concerts...</p>
            </div>
          ) : concerts && concerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concerts.map((concert) => (
                <div
                  key={concert.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold text-blue-600 mb-3">{concert.name}</h2>
                  {concert.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{concert.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium">{concert.totalSeats.toLocaleString()}</span>
                  </div>
                  <div className="mt-4">
                    {concert.isReserved ? (
                      <button
                        onClick={() => handleCancel(concert.id)}
                        disabled={cancelMutation.isPending}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReserve(concert.id)}
                        disabled={
                          reserveMutation.isPending ||
                          (concert.availableSeats || concert.totalSeats - concert.reservedSeats) <= 0
                        }
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {reserveMutation.isPending ? 'Reserving...' : 'Reserve'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No concerts available at this time.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

