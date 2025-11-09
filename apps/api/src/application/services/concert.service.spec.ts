import { Test, TestingModule } from '@nestjs/testing';
import { ConcertService, BookingService } from './concert.service';
import { ConcertRepository, BookingRepository, CachePort, UnitOfWork } from '../../core/ports';
import { Concert } from '../../core/entities/concert.entity';
import { Booking, BookingStatus } from '../../core/entities/booking.entity';

describe('ConcertService', () => {
  let service: ConcertService;
  let mockConcertRepository: jest.Mocked<ConcertRepository>;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;
  let mockCache: jest.Mocked<CachePort>;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: 'ConcertRepository',
          useValue: mockConcertRepository,
        },
        {
          provide: 'BookingRepository',
          useValue: mockBookingRepository,
        },
        {
          provide: 'UnitOfWork',
          useValue: mockUnitOfWork,
        },
        {
          provide: 'CachePort',
          useValue: mockCache,
        },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
  });

  describe('createConcert', () => {
    it('should create a concert', async () => {
      const input = {
        name: 'Test Concert',
        description: 'Description',
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

      const result = await service.createConcert(input);

      expect(result).toEqual(createdConcert);
    });
  });

  describe('getAllConcerts', () => {
    it('should return concerts from cache if available', async () => {
      const cachedConcerts = [
        new Concert('concert-1', 'Concert 1', 'Desc', 100, 50, new Date(), new Date()),
      ];

      mockCache.get.mockResolvedValue(cachedConcerts);

      const result = await service.getAllConcerts();

      expect(result).toEqual(cachedConcerts);
      expect(mockCache.get).toHaveBeenCalledWith('concerts:all');
      expect(mockConcertRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const concerts = [
        new Concert('concert-1', 'Concert 1', 'Desc', 100, 50, new Date(), new Date()),
      ];

      mockCache.get.mockResolvedValue(null);
      mockConcertRepository.findAll.mockResolvedValue(concerts);

      const result = await service.getAllConcerts();

      expect(result).toEqual(concerts);
      expect(mockConcertRepository.findAll).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith('concerts:all', concerts, 300);
    });
  });

  describe('getConcertById', () => {
    it('should return concert from cache if available', async () => {
      const cachedConcert = new Concert(
        'concert-1',
        'Concert 1',
        'Desc',
        100,
        50,
        new Date(),
        new Date(),
      );

      mockCache.get.mockResolvedValue(cachedConcert);

      const result = await service.getConcertById('concert-1');

      expect(result).toEqual(cachedConcert);
      expect(mockCache.get).toHaveBeenCalledWith('concert:concert-1');
      expect(mockConcertRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const concert = new Concert(
        'concert-1',
        'Concert 1',
        'Desc',
        100,
        50,
        new Date(),
        new Date(),
      );

      mockCache.get.mockResolvedValue(null);
      mockConcertRepository.findById.mockResolvedValue(concert);

      const result = await service.getConcertById('concert-1');

      expect(result).toEqual(concert);
      expect(mockConcertRepository.findById).toHaveBeenCalledWith('concert-1');
      expect(mockCache.set).toHaveBeenCalledWith('concert:concert-1', concert, 300);
    });

    it('should return null if concert not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockConcertRepository.findById.mockResolvedValue(null);

      const result = await service.getConcertById('non-existent');

      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteConcert', () => {
    it('should cancel all bookings, delete concert and invalidate cache', async () => {
      mockBookingRepository.cancelAllByConcertId.mockResolvedValue(undefined);
      mockConcertRepository.delete.mockResolvedValue(undefined);

      await service.deleteConcert('concert-1');

      expect(mockBookingRepository.cancelAllByConcertId).toHaveBeenCalledWith('concert-1');
      expect(mockConcertRepository.delete).toHaveBeenCalledWith('concert-1');
      expect(mockCache.invalidatePattern).toHaveBeenCalledWith('concert:concert-1*');
      expect(mockCache.invalidatePattern).toHaveBeenCalledWith('concerts:*');
    });
  });

  describe('reserveSeat', () => {
    it('should call reserveSeatUseCase', async () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.RESERVED,
        new Date(),
        new Date(),
      );

      mockUnitOfWork.execute.mockResolvedValue(booking);

      const result = await service.reserveSeat('concert-1', 'user-1');

      expect(result).toEqual(booking);
    });
  });

  describe('cancelReservation', () => {
    it('should call cancelBookingUseCase', async () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.CANCELED,
        new Date(),
        new Date(),
      );

      mockUnitOfWork.execute.mockResolvedValue(booking);

      const result = await service.cancelReservation('concert-1', 'user-1');

      expect(result).toEqual(booking);
    });
  });
});

describe('BookingService', () => {
  let service: BookingService;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let mockCache: jest.Mocked<CachePort>;

  beforeEach(async () => {
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

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: 'BookingRepository',
          useValue: mockBookingRepository,
        },
        {
          provide: 'CachePort',
          useValue: mockCache,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  describe('getUserBookings', () => {
    it('should return user bookings', async () => {
      const bookings = [
        new Booking('booking-1', 'concert-1', 'user-1', BookingStatus.RESERVED, new Date(), new Date()),
      ];

      mockBookingRepository.findByUserId.mockResolvedValue(bookings);

      const result = await service.getUserBookings('user-1');

      expect(result).toEqual(bookings);
      expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const bookings = [
        new Booking('booking-1', 'concert-1', 'user-1', BookingStatus.RESERVED, new Date(), new Date()),
      ];

      mockBookingRepository.findAll.mockResolvedValue(bookings);

      const result = await service.getAllBookings();

      expect(result).toEqual(bookings);
      expect(mockBookingRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserBookingForConcert', () => {
    it('should return booking for user and concert', async () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.RESERVED,
        new Date(),
        new Date(),
      );

      mockBookingRepository.findByConcertAndUser.mockResolvedValue(booking);

      const result = await service.getUserBookingForConcert('concert-1', 'user-1');

      expect(result).toEqual(booking);
      expect(mockBookingRepository.findByConcertAndUser).toHaveBeenCalledWith('concert-1', 'user-1');
    });
  });
});

