'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth-store'
import { format } from 'date-fns'
import { UserSidebar } from '@/components/Sidebar'

export default function UserHistory() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'me', user?.id],
    queryFn: () => bookingApi.getMyBookings(),
  })

  const getConcertName = (booking: any) => {
    return booking.concertName || booking.concertId
  }

  return (
    <div className="flex min-h-screen bg-gray-700 dark:bg-black">
      <UserSidebar currentPath="/user/history" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 bg-white dark:bg-black p-4 md:p-8">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden mb-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Booking History</h1>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Reservations</h2>
            </div>
            {isLoading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading bookings...</div>
            ) : bookings && bookings.length > 0 ? (
              <>
                {/* Card layout for small and medium screens */}
                <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-800">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'RESERVED'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Concert Name</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-medium">
                            {getConcertName(booking)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table layout for large screens */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Concert Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {getConcertName(booking)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'RESERVED'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">No bookings found</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

