const mockGet = jest.fn()
const mockPost = jest.fn()
const mockDelete = jest.fn()

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios')
  return {
    ...actualAxios,
    create: jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    })),
  }
})

import { concertApi, bookingApi } from '../../api'

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token')
  })

  describe('concertApi', () => {
    describe('getAll', () => {
      it('should fetch all concerts', async () => {
        const concerts = [
          {
            id: 'concert-1',
            name: 'Concert 1',
            description: 'Description',
            totalSeats: 100,
            reservedSeats: 50,
          },
        ]

        mockGet.mockResolvedValue({ data: concerts })

        const result = await concertApi.getAll()

        expect(mockGet).toHaveBeenCalledWith('/concerts')
        expect(result).toEqual(concerts)
      })
    })

    describe('getById', () => {
      it('should fetch concert by id', async () => {
        const concert = {
          id: 'concert-1',
          name: 'Concert 1',
          description: 'Description',
          totalSeats: 100,
          reservedSeats: 50,
        }

        mockGet.mockResolvedValue({ data: concert })

        const result = await concertApi.getById('concert-1')

        expect(mockGet).toHaveBeenCalledWith('/concerts/concert-1')
        expect(result).toEqual(concert)
      })
    })

    describe('create', () => {
      it('should create a concert', async () => {
        const concertDto = {
          name: 'New Concert',
          description: 'Description',
          totalSeats: 100,
        }

        const createdConcert = {
          id: 'concert-1',
          ...concertDto,
          reservedSeats: 0,
        }

        mockPost.mockResolvedValue({ data: createdConcert })

        const result = await concertApi.create(concertDto)

        expect(mockPost).toHaveBeenCalledWith('/concerts', concertDto)
        expect(result).toEqual(createdConcert)
      })
    })

    describe('delete', () => {
      it('should delete a concert', async () => {
        mockDelete.mockResolvedValue({ data: {} })

        await concertApi.delete('concert-1')

        expect(mockDelete).toHaveBeenCalledWith('/concerts/concert-1')
      })
    })

    describe('reserve', () => {
      it('should reserve a seat', async () => {
        const booking = {
          id: 'booking-1',
          concertId: 'concert-1',
          userId: 'user-001',
          status: 'RESERVED',
          createdAt: '2024-01-01',
        }

        mockPost.mockResolvedValue({ data: booking })

        const result = await concertApi.reserve('concert-1')

        expect(mockPost).toHaveBeenCalledWith('/concerts/concert-1/reserve', {})
        expect(result).toEqual(booking)
      })
    })

    describe('cancel', () => {
      it('should cancel a reservation', async () => {
        const booking = {
          id: 'booking-1',
          concertId: 'concert-1',
          userId: 'user-001',
          status: 'CANCELED',
          createdAt: '2024-01-01',
        }

        mockPost.mockResolvedValue({ data: booking })

        const result = await concertApi.cancel('concert-1')

        expect(mockPost).toHaveBeenCalledWith('/concerts/concert-1/cancel', {})
        expect(result).toEqual(booking)
      })
    })
  })

  describe('bookingApi', () => {
    describe('getMyBookings', () => {
      it('should fetch user bookings', async () => {
        const bookings = [
          {
            id: 'booking-1',
            concertId: 'concert-1',
            userId: 'user-001',
            status: 'RESERVED',
            createdAt: '2024-01-01',
          },
        ]

        mockGet.mockResolvedValue({ data: bookings })

        const result = await bookingApi.getMyBookings()

        expect(mockGet).toHaveBeenCalledWith('/bookings/me')
        expect(result).toEqual(bookings)
      })
    })

    describe('getAllBookings', () => {
      it('should fetch all bookings', async () => {
        const bookings = [
          {
            id: 'booking-1',
            concertId: 'concert-1',
            userId: 'user-001',
            status: 'RESERVED',
            createdAt: '2024-01-01',
          },
        ]

        mockGet.mockResolvedValue({ data: bookings })

        const result = await bookingApi.getAllBookings()

        expect(mockGet).toHaveBeenCalledWith('/bookings')
        expect(result).toEqual(bookings)
      })
    })
  })
})
