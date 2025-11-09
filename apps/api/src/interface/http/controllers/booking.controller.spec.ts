import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from '../../../application/services/concert.service';
import { Booking, BookingStatus } from '../../../core/entities/booking.entity';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  beforeEach(async () => {
    bookingService = {
      getUserBookings: jest.fn(),
      getAllBookings: jest.fn(),
      getUserBookingForConcert: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: bookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  describe('getMyBookings', () => {
    it('should return user bookings', async () => {
      const bookings = [
        new Booking('booking-1', 'concert-1', 'user-1', BookingStatus.RESERVED, new Date(), new Date()),
      ];

      bookingService.getUserBookings.mockResolvedValue(bookings);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getMyBookings(req);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'booking-1',
        concertId: 'concert-1',
        userId: 'user-1',
        status: BookingStatus.RESERVED,
      });
      expect(result[0]).toHaveProperty('createdAt');
      expect(bookingService.getUserBookings).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings for ADMIN', async () => {
      const bookings = [
        new Booking('booking-1', 'concert-1', 'user-1', BookingStatus.RESERVED, new Date(), new Date()),
      ];

      bookingService.getAllBookings.mockResolvedValue(bookings);

      const req = { user: { id: 'admin-1', role: 'ADMIN' } };
      const result = await controller.getAllBookings(req);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'booking-1',
        concertId: 'concert-1',
        userId: 'user-1',
        status: BookingStatus.RESERVED,
      });
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should throw error for non-admin user', async () => {
      const req = { user: { id: 'user-1', role: 'USER' } };
      bookingService.getAllBookings.mockResolvedValue(undefined as any);

      await expect(controller.getAllBookings(req)).rejects.toThrow();
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });
  });
});

