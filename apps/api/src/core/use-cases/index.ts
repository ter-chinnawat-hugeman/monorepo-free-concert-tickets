import { Concert } from '../entities/concert.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import {
  ConcertRepository,
  BookingRepository,
  CachePort,
  UnitOfWork,
} from '../ports';

export class CreateConcertUseCase {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly cache: CachePort,
  ) {}

  async execute(input: {
    name: string;
    description?: string;
    totalSeats: number;
  }): Promise<Concert> {

    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Concert name is required');
    }

    if (input.totalSeats <= 0) {
      throw new Error('Total seats must be greater than 0');
    }

    const concert = new Concert(
      '', 
      input.name.trim(),
      input.description?.trim() || null,
      input.totalSeats,
      0, 
      new Date(),
      new Date(),
      null,
    );

    // Persist
    const created = await this.concertRepository.create(concert);

    // Invalidate cache
    await this.cache.invalidatePattern('concerts:*');

    return created;
  }
}

export class ReserveSeatUseCase {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly cache: CachePort,
  ) {}

  async execute(input: {
    concertId: string;
    userId: string;
  }): Promise<Booking> {
    return this.unitOfWork.execute(async () => {
      const existingBooking = await this.bookingRepository.findByConcertAndUser(
        input.concertId,
        input.userId,
      );

      if (existingBooking && existingBooking.status === BookingStatus.RESERVED) {
        throw new Error('User already has a reservation for this concert');
      }

      const concert = await this.concertRepository.findById(input.concertId);
      if (!concert) {
        throw new Error('Concert not found');
      }

      if (!concert.canReserve()) {
        throw new Error('Concert is fully booked');
      }

      const updatedConcert = concert.reserveSeat();
      await this.concertRepository.update(updatedConcert);

      let booking: Booking;
      if (existingBooking && existingBooking.status === BookingStatus.CANCELED) {
        booking = new Booking(
          existingBooking.id,
          existingBooking.concertId,
          existingBooking.userId,
          BookingStatus.RESERVED,
          existingBooking.createdAt,
          new Date(),
        );
        await this.bookingRepository.update(booking);
      } else {
        booking = new Booking(
          '',
          input.concertId,
          input.userId,
          BookingStatus.RESERVED,
          new Date(),
          new Date(),
        );
        booking = await this.bookingRepository.create(booking);
      }

      await this.cache.invalidatePattern(`concert:${input.concertId}*`);
      await this.cache.invalidatePattern('concerts:*');

      return booking;
    });
  }
}

export class CancelBookingUseCase {
  constructor(
    private readonly concertRepository: ConcertRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly cache: CachePort,
  ) {}

  async execute(input: {
    concertId: string;
    userId: string;
  }): Promise<Booking> {
    return this.unitOfWork.execute(async () => {
      const booking = await this.bookingRepository.findByConcertAndUser(
        input.concertId,
        input.userId,
      );

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === BookingStatus.CANCELED) {
        throw new Error('Booking already canceled');
      }

      const concert = await this.concertRepository.findById(input.concertId);
      if (!concert) {
        throw new Error('Concert not found');
      }

      const canceledBooking = booking.cancel();
      const updatedConcert = concert.cancelReservation();

      await this.bookingRepository.update(canceledBooking);
      await this.concertRepository.update(updatedConcert);

      await this.cache.invalidatePattern(`concert:${input.concertId}*`);
      await this.cache.invalidatePattern('concerts:*');

      return canceledBooking;
    });
  }
}

