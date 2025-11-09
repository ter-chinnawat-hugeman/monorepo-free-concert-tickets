'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { concertApi, bookingApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth-store'
import toast from 'react-hot-toast'
import { AdminSidebar } from '@/components/Sidebar'
import { DeleteModal } from '@/components/DeleteModal'

export default function AdminHome() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; concertId: string | null; concertName: string }>({
    isOpen: false,
    concertId: null,
    concertName: '',
  })

  const { data: concerts, isLoading: concertsLoading } = useQuery({
    queryKey: ['concerts', user?.id, user?.role],
    queryFn: () => concertApi.getAll(),
  })

  const { data: bookings } = useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: () => bookingApi.getAllBookings(),
    enabled: user?.role === 'ADMIN',
  })

  const deleteMutation = useMutation({
    mutationFn: concertApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerts'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setDeleteModal({ isOpen: false, concertId: null, concertName: '' })
      toast.success('Delete successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete concert')
    },
  })

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, concertId: id, concertName: name })
  }

  const handleConfirmDelete = () => {
    if (deleteModal.concertId) {
      deleteMutation.mutate(deleteModal.concertId)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, concertId: null, concertName: '' })
  }

  // Calculate statistics
  const stats = {
    totalSeats: concerts?.reduce((sum, c) => sum + c.totalSeats, 0) || 0,
    reserved: concerts?.reduce((sum, c) => sum + c.reservedSeats, 0) || 0,
    cancelled: bookings?.filter((b) => b.status === 'CANCELED').length || 0,
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <AdminSidebar currentPath="/admin/home" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 bg-white dark:bg-black">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden bg-gray-800 dark:bg-gray-900 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">Admin - Home</h1>
        </div>

        <div className="p-4 md:p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium opacity-90">Total of seats</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.totalSeats.toLocaleString()}</p>
            </div>
            <div className="bg-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium opacity-90">Reserve</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.reserved.toLocaleString()}</p>
            </div>
            <div className="bg-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium opacity-90">Cancel</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.cancelled.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Create
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  {concertsLoading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading concerts...</p>
                  ) : concerts && concerts.length > 0 ? (
                    <div className="space-y-4">
                      {concerts.map((concert) => (
                        <div
                          key={concert.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors gap-4"
                        >
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">{concert.name}</h3>
                            {concert.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{concert.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-sm font-medium">{concert.totalSeats.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(concert.id, concert.name)}
                            className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No concerts found</p>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <CreateConcertForm onSuccess={() => setActiveTab('overview')} />
              )}
            </div>
          </div>
        </div>
      </main>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        concertName={deleteModal.concertName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

function CreateConcertForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalSeats: '',
  })

  const createMutation = useMutation({
    mutationFn: concertApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerts'] })
      toast.success('Concert created successfully!')
      setFormData({ name: '', description: '', totalSeats: '' })
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create concert')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      totalSeats: parseInt(formData.totalSeats),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Concert Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Total Seats *
        </label>
        <input
          type="number"
          id="totalSeats"
          required
          min="1"
          value={formData.totalSeats}
          onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {createMutation.isPending ? 'Creating...' : 'Create Concert'}
      </button>
    </form>
  )
}

