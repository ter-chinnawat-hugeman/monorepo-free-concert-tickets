import { concertApi, bookingApi, getAuthHeaders, apiClient } from '../api'

// Mock axios
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios')
  return {
    ...actualAxios,
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    })),
  }
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuthHeaders', () => {
    it('should return default headers for user', () => {
      const headers = getAuthHeaders()
      expect(headers).toEqual({
        'x-user-id': 'user-001',
        'x-user-role': 'USER',
      })
    })

    it('should return custom headers', () => {
      const headers = getAuthHeaders('admin-001', 'ADMIN')
      expect(headers).toEqual({
        'x-user-id': 'admin-001',
        'x-user-role': 'ADMIN',
      })
    })
  })

  describe('concertApi', () => {
    beforeEach(() => {
      ;(apiClient.get as jest.Mock) = jest.fn()
      ;(apiClient.post as jest.Mock) = jest.fn()
      ;(apiClient.delete as jest.Mock) = jest.fn()
    })

    describe('getAll', () => {
      it('should fetch all concerts without auth headers when no userId provided', async () => {
        const concerts = [
          {
            id: 'concert-1',
            name: 'Concert 1',
            description: 'Description',
            totalSeats: 100,
            reservedSeats: 50,
          },
        ]

        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: concerts })

        const result = await concertApi.getAll()

        expect(apiClient.get).toHaveBeenCalledWith('/concerts', {
          headers: {},
        })
        expect(result).toEqual(concerts)
      })

      it('should fetch concerts with auth headers when userId provided', async () => {
        const concerts = [
          {
            id: 'concert-1',
            name: 'Concert 1',
            description: 'Description',
            totalSeats: 100,
            reservedSeats: 50,
          },
        ]

        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: concerts })

        const result = await concertApi.getAll('user-001', 'USER')

        expect(apiClient.get).toHaveBeenCalledWith('/concerts', {
          headers: {
            'x-user-id': 'user-001',
            'x-user-role': 'USER',
          },
        })
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

        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: concert })

        const result = await concertApi.getById('concert-1')

        expect(apiClient.get).toHaveBeenCalledWith('/concerts/concert-1')
        expect(result).toEqual(concert)
      })
    })

    describe('create', () => {
      it('should create a concert with admin headers', async () => {
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

        ;(apiClient.post as jest.Mock).mockResolvedValue({ data: createdConcert })

        const result = await concertApi.create(concertDto)

        expect(apiClient.post).toHaveBeenCalledWith(
          '/concerts',
          concertDto,
          {
            headers: {
              'x-user-id': 'admin-001',
              'x-user-role': 'ADMIN',
            },
          },
        )
        expect(result).toEqual(createdConcert)
      })
    })

    describe('delete', () => {
      it('should delete a concert with admin headers', async () => {
        ;(apiClient.delete as jest.Mock).mockResolvedValue({ data: {} })

        await concertApi.delete('concert-1')

        expect(apiClient.delete).toHaveBeenCalledWith('/concerts/concert-1', {
          headers: {
            'x-user-id': 'admin-001',
            'x-user-role': 'ADMIN',
          },
        })
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

        ;(apiClient.post as jest.Mock).mockResolvedValue({ data: booking })

        const result = await concertApi.reserve('concert-1', 'user-001')

        expect(apiClient.post).toHaveBeenCalledWith(
          '/concerts/concert-1/reserve',
          {},
          {
            headers: {
              'x-user-id': 'user-001',
              'x-user-role': 'USER',
            },
          },
        )
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

        ;(apiClient.post as jest.Mock).mockResolvedValue({ data: booking })

        const result = await concertApi.cancel('concert-1', 'user-001')

        expect(apiClient.post).toHaveBeenCalledWith(
          '/concerts/concert-1/cancel',
          {},
          {
            headers: {
              'x-user-id': 'user-001',
              'x-user-role': 'USER',
            },
          },
        )
        expect(result).toEqual(booking)
      })
    })
  })

  describe('bookingApi', () => {
    beforeEach(() => {
      ;(apiClient.get as jest.Mock) = jest.fn()
    })

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

        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: bookings })

        const result = await bookingApi.getMyBookings('user-001')

        expect(apiClient.get).toHaveBeenCalledWith('/bookings/me', {
          headers: {
            'x-user-id': 'user-001',
            'x-user-role': 'USER',
          },
        })
        expect(result).toEqual(bookings)
      })
    })

    describe('getAllBookings', () => {
      it('should fetch all bookings with admin headers', async () => {
        const bookings = [
          {
            id: 'booking-1',
            concertId: 'concert-1',
            userId: 'user-001',
            status: 'RESERVED',
            createdAt: '2024-01-01',
          },
        ]

        ;(apiClient.get as jest.Mock).mockResolvedValue({ data: bookings })

        const result = await bookingApi.getAllBookings()

        expect(apiClient.get).toHaveBeenCalledWith('/bookings', {
          headers: {
            'x-user-id': 'admin-001',
            'x-user-role': 'ADMIN',
          },
        })
        expect(result).toEqual(bookings)
      })
    })
  })
})
