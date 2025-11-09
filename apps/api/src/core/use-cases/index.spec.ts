import {
  CreateConcertUseCase,
  ReserveSeatUseCase,
  CancelBookingUseCase,
} from './index';
import { Concert } from '../entities/concert.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import {
  ConcertRepository,
  BookingRepository,
  CachePort,
  UnitOfWork,
} from '../ports';

describe('CreateConcertUseCase', () => {
  let useCase: CreateConcertUseCase;
  let mockConcertRepository: jest.Mocked<ConcertRepository>;
  let mockCache: jest.Mocked<CachePort>;

  beforeEach(() => {
    mockConcertRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    useCase = new CreateConcertUseCase(mockConcertRepository, mockCache);
  });

  it('should create a concert successfully', async () => {
    const input = {
      name: 'Test Concert',
      description: 'Test Description',
      totalSeats: 100,
    };

    const createdConcert = new Concert(
      'concert-1',
      input.name,
      input.description,
      input.totalSeats,
      0,
      new Date(),
      new Date(),
    );

    mockConcertRepository.create.mockResolvedValue(createdConcert);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdConcert);
    expect(mockConcertRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: input.name,
        description: input.description,
        totalSeats: input.totalSeats,
        reservedSeats: 0,
      }),
    );
    expect(mockCache.invalidatePattern).toHaveBeenCalledWith('concerts:*');
  });

  it('should trim whitespace from name and description', async () => {
    const input = {
      name: '  Test Concert  ',
      description: '  Test Description  ',
      totalSeats: 100,
    };

    const createdConcert = new Concert(
      'concert-1',
      'Test Concert',
      'Test Description',
      100,
      0,
      new Date(),
      new Date(),
    );

    mockConcertRepository.create.mockResolvedValue(createdConcert);

    await useCase.execute(input);

    expect(mockConcertRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Concert',
        description: 'Test Description',
      }),
    );
  });

  it('should throw error when name is empty', async () => {
    const input = {
      name: '',
      totalSeats: 100,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Concert name is required',
    );
  });

  it('should throw error when name is only whitespace', async () => {
    const input = {
      name: '   ',
      totalSeats: 100,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Concert name is required',
    );
  });

  it('should throw error when totalSeats is zero', async () => {
    const input = {
      name: 'Test Concert',
      totalSeats: 0,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Total seats must be greater than 0',
    );
  });

  it('should throw error when totalSeats is negative', async () => {
    const input = {
      name: 'Test Concert',
      totalSeats: -10,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'Total seats must be greater than 0',
    );
  });

  it('should handle optional description', async () => {
    const input = {
      name: 'Test Concert',
      totalSeats: 100,
    };

    const createdConcert = new Concert(
      'concert-1',
      input.name,
      null,
      input.totalSeats,
      0,
      new Date(),
      new Date(),
    );

    mockConcertRepository.create.mockResolvedValue(createdConcert);

    await useCase.execute(input);

    expect(mockConcertRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });
});

describe('ReserveSeatUseCase', () => {
  let useCase: ReserveSeatUseCase;
  let mockConcertRepository: jest.Mocked<ConcertRepository>;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;
  let mockCache: jest.Mocked<CachePort>;

  beforeEach(() => {
    mockConcertRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBookingRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
      findByConcertAndUser: jest.fn(),
      findByConcertId: jest.fn(),
      cancelAllByConcertId: jest.fn(),
    };

    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    useCase = new ReserveSeatUseCase(
      mockConcertRepository,
      mockBookingRepository,
      mockUnitOfWork,
      mockCache,
    );
  });

  it('should reserve a seat successfully', async () => {
    const concert = new Concert(
      'concert-1',
      'Test Concert',
      'Description',
      100,
      50,
      new Date(),
      new Date(),
    );

    const booking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.RESERVED,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(null);
    mockConcertRepository.findById.mockResolvedValue(concert);
    mockConcertRepository.update.mockResolvedValue(concert.reserveSeat());
    mockBookingRepository.create.mockResolvedValue(booking);

    const result = await useCase.execute({
      concertId: 'concert-1',
      userId: 'user-1',
    });

    expect(result).toEqual(booking);
    expect(mockBookingRepository.findByConcertAndUser).toHaveBeenCalledWith(
      'concert-1',
      'user-1',
    );
    expect(mockConcertRepository.findById).toHaveBeenCalledWith('concert-1');
    expect(mockConcertRepository.update).toHaveBeenCalled();
    expect(mockBookingRepository.create).toHaveBeenCalled();
    expect(mockCache.invalidatePattern).toHaveBeenCalledWith(
      'concert:concert-1*',
    );
    expect(mockCache.invalidatePattern).toHaveBeenCalledWith('concerts:*');
  });

  it('should throw error when concert not found', async () => {
    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(null);
    mockConcertRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        concertId: 'non-existent',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Concert not found');
  });

  it('should throw error when concert is fully booked', async () => {
    const concert = new Concert(
      'concert-1',
      'Test Concert',
      'Description',
      100,
      100,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(null);
    mockConcertRepository.findById.mockResolvedValue(concert);

    await expect(
      useCase.execute({
        concertId: 'concert-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Concert is fully booked');
  });

  it('should throw error when user already has reservation', async () => {
    const existingBooking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.RESERVED,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(
      existingBooking,
    );

    await expect(
      useCase.execute({
        concertId: 'concert-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('User already has a reservation for this concert');
  });

  it('should reactivate canceled booking', async () => {
    const concert = new Concert(
      'concert-1',
      'Test Concert',
      'Description',
      100,
      50,
      new Date(),
      new Date(),
    );

    const canceledBooking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.CANCELED,
      new Date(),
      new Date(),
    );

    const reactivatedBooking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.RESERVED,
      canceledBooking.createdAt,
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(
      canceledBooking,
    );
    mockConcertRepository.findById.mockResolvedValue(concert);
    mockConcertRepository.update.mockResolvedValue(concert.reserveSeat());
    mockBookingRepository.update.mockResolvedValue(reactivatedBooking);

    const result = await useCase.execute({
      concertId: 'concert-1',
      userId: 'user-1',
    });

    expect(result.status).toBe(BookingStatus.RESERVED);
    expect(mockBookingRepository.update).toHaveBeenCalled();
    expect(mockBookingRepository.create).not.toHaveBeenCalled();
  });
});

describe('CancelBookingUseCase', () => {
  let useCase: CancelBookingUseCase;
  let mockConcertRepository: jest.Mocked<ConcertRepository>;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;
  let mockCache: jest.Mocked<CachePort>;

  beforeEach(() => {
    mockConcertRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBookingRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
      findByConcertAndUser: jest.fn(),
      findByConcertId: jest.fn(),
      cancelAllByConcertId: jest.fn(),
    };

    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      execute: jest.fn(),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    useCase = new CancelBookingUseCase(
      mockConcertRepository,
      mockBookingRepository,
      mockUnitOfWork,
      mockCache,
    );
  });

  it('should cancel booking successfully', async () => {
    const concert = new Concert(
      'concert-1',
      'Test Concert',
      'Description',
      100,
      50,
      new Date(),
      new Date(),
    );

    const booking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.RESERVED,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(booking);
    mockConcertRepository.findById.mockResolvedValue(concert);
    mockBookingRepository.update.mockResolvedValue(booking.cancel());
    mockConcertRepository.update.mockResolvedValue(concert.cancelReservation());

    const result = await useCase.execute({
      concertId: 'concert-1',
      userId: 'user-1',
    });

    expect(result.status).toBe(BookingStatus.CANCELED);
    expect(mockBookingRepository.update).toHaveBeenCalled();
    expect(mockConcertRepository.update).toHaveBeenCalled();
    expect(mockCache.invalidatePattern).toHaveBeenCalledWith(
      'concert:concert-1*',
    );
    expect(mockCache.invalidatePattern).toHaveBeenCalledWith('concerts:*');
  });

  it('should throw error when booking not found', async () => {
    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute({
        concertId: 'concert-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Booking not found');
  });

  it('should throw error when booking already canceled', async () => {
    const canceledBooking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.CANCELED,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(
      canceledBooking,
    );

    await expect(
      useCase.execute({
        concertId: 'concert-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Booking already canceled');
  });

  it('should throw error when concert not found', async () => {
    const booking = new Booking(
      'booking-1',
      'concert-1',
      'user-1',
      BookingStatus.RESERVED,
      new Date(),
      new Date(),
    );

    mockUnitOfWork.execute.mockImplementation(async (fn) => fn());
    mockBookingRepository.findByConcertAndUser.mockResolvedValue(booking);
    mockConcertRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        concertId: 'concert-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Concert not found');
  });
});
