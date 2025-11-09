import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        // Use dynamic import to avoid circular dependency
        import('./store/auth-store').then(({ useAuthStore }) => {
          useAuthStore.getState().clearAuth()
        })
        window.location.href = '/login'
      }
    }
    // Return error as-is so components can access error.response.data
    return Promise.reject(error)
  },
)

export interface Concert {
  id: string
  name: string
  description: string | null
  totalSeats: number
  reservedSeats: number
  availableSeats?: number
  isReserved?: boolean
  bookingId?: string
}

export interface Booking {
  id: string
  concertId: string
  userId: string
  status: 'RESERVED' | 'CANCELED'
  createdAt: string
}

export interface CreateConcertDto {
  name: string
  description?: string
  totalSeats: number
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  password: string
  role?: 'USER' | 'ADMIN'
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    username: string
    role: 'ADMIN' | 'USER'
  }
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', dto)
    return data
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', dto)
    return data
  },
}

export const concertApi = {
  getAll: async (): Promise<Concert[]> => {
    const { data } = await apiClient.get('/concerts')
    return data
  },

  getById: async (id: string): Promise<Concert> => {
    const { data } = await apiClient.get(`/concerts/${id}`)
    return data
  },

  create: async (concert: CreateConcertDto): Promise<Concert> => {
    const { data } = await apiClient.post('/concerts', concert)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/concerts/${id}`)
  },

  reserve: async (concertId: string): Promise<Booking> => {
    const { data } = await apiClient.post(`/concerts/${concertId}/reserve`, {})
    return data
  },

  cancel: async (concertId: string): Promise<Booking> => {
    const { data } = await apiClient.post(`/concerts/${concertId}/cancel`, {})
    return data
  },
}

export const bookingApi = {
  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get('/bookings/me')
    return data
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get('/bookings')
    return data
  },
}

