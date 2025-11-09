import { Test, TestingModule } from '@nestjs/testing';
import { ConcertController } from './concert.controller';
import { ConcertService, BookingService } from '../../../application/services/concert.service';
import { Concert } from '../../../core/entities/concert.entity';
import { Booking, BookingStatus } from '../../../core/entities/booking.entity';

describe('ConcertController', () => {
  let controller: ConcertController;
  let concertService: jest.Mocked<ConcertService>;
  let bookingService: jest.Mocked<BookingService>;

  beforeEach(async () => {
    concertService = {
      getAllConcerts: jest.fn(),
      getConcertById: jest.fn(),
      createConcert: jest.fn(),
      deleteConcert: jest.fn(),
      reserveSeat: jest.fn(),
      cancelReservation: jest.fn(),
    } as any;

    bookingService = {
      getUserBookingForConcert: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertController],
      providers: [
        {
          provide: ConcertService,
          useValue: concertService,
        },
        {
          provide: BookingService,
          useValue: bookingService,
        },
      ],
    }).compile();

    controller = module.get<ConcertController>(ConcertController);
  });

  describe('findAll', () => {
    it('should return concerts with booking status for USER role', async () => {
      const concerts = [
        new Concert('concert-1', 'Concert 1', 'Desc', 100, 50, new Date(), new Date()),
      ];

      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.RESERVED,
        new Date(),
        new Date(),
      );

      concertService.getAllConcerts.mockResolvedValue(concerts);
      bookingService.getUserBookingForConcert.mockResolvedValue(booking);

      const req = { user: { id: 'user-1', role: 'USER' } };
      const result = await controller.findAll(req);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'concert-1',
        name: 'Concert 1',
        isReserved: true,
        bookingId: 'booking-1',
      });
    });

    it('should return concerts without booking status for ADMIN role', async () => {
      const concerts = [
        new Concert('concert-1', 'Concert 1', 'Desc', 100, 50, new Date(), new Date()),
      ];

      concertService.getAllConcerts.mockResolvedValue(concerts);

      const req = { user: { id: 'admin-1', role: 'ADMIN' } };
      const result = await controller.findAll(req);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'concert-1',
        name: 'Concert 1',
      });
      expect(result[0]).not.toHaveProperty('isReserved');
      expect(bookingService.getUserBookingForConcert).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return concert by id', async () => {
      const concert = new Concert('concert-1', 'Concert 1', 'Desc', 100, 50, new Date(), new Date());

      concertService.getConcertById.mockResolvedValue(concert);

      const result = await controller.findOne('concert-1');

      expect(result).toMatchObject({
        id: 'concert-1',
        name: 'Concert 1',
        totalSeats: 100,
        reservedSeats: 50,
        availableSeats: 50,
      });
    });

    it('should throw error when concert not found', async () => {
      concertService.getConcertById.mockResolvedValue(null);

      await expect(controller.findOne('non-existent')).rejects.toThrow('Concert not found');
    });
  });

  describe('create', () => {
    it('should create a concert', async () => {
      const dto = {
        name: 'New Concert',
        description: 'Description',
        totalSeats: 100,
      };

      const createdConcert = new Concert(
        'concert-1',
        dto.name,
        dto.description,
        dto.totalSeats,
        0,
        new Date(),
        new Date(),
      );

      concertService.createConcert.mockResolvedValue(createdConcert);

      const result = await controller.create(dto);

      expect(result).toMatchObject({
        id: 'concert-1',
        name: 'New Concert',
        totalSeats: 100,
        reservedSeats: 0,
      });
      expect(concertService.createConcert).toHaveBeenCalledWith(dto);
    });
  });

  describe('delete', () => {
    it('should delete a concert', async () => {
      concertService.deleteConcert.mockResolvedValue(undefined);

      await controller.delete('concert-1');

      expect(concertService.deleteConcert).toHaveBeenCalledWith('concert-1');
    });
  });

  describe('reserve', () => {
    it('should reserve a seat', async () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.RESERVED,
        new Date(),
        new Date(),
      );

      concertService.reserveSeat.mockResolvedValue(booking);

      const req = { user: { id: 'user-1' } };
      const result = await controller.reserve('concert-1', req);

      expect(result).toMatchObject({
        id: 'booking-1',
        concertId: 'concert-1',
        userId: 'user-1',
        status: BookingStatus.RESERVED,
      });
      expect(concertService.reserveSeat).toHaveBeenCalledWith('concert-1', 'user-1');
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.CANCELED,
        new Date(),
        new Date(),
      );

      concertService.cancelReservation.mockResolvedValue(booking);

      const req = { user: { id: 'user-1' } };
      const result = await controller.cancel('concert-1', req);

      expect(result).toMatchObject({
        id: 'booking-1',
        concertId: 'concert-1',
        userId: 'user-1',
        status: BookingStatus.CANCELED,
      });
      expect(concertService.cancelReservation).toHaveBeenCalledWith('concert-1', 'user-1');
    });
  });
});

