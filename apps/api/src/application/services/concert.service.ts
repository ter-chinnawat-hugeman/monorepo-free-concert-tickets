// Application Layer: Service that orchestrates use cases

import { Injectable, Inject } from '@nestjs/common';
import { CreateConcertUseCase, ReserveSeatUseCase, CancelBookingUseCase } from '../../core/use-cases';
import { ConcertRepository, BookingRepository, CachePort, UnitOfWork } from '../../core/ports';
import { Concert } from '../../core/entities/concert.entity';

@Injectable()
export class ConcertService {
  private createConcertUseCase: CreateConcertUseCase;
  private reserveSeatUseCase: ReserveSeatUseCase;
  private cancelBookingUseCase: CancelBookingUseCase;

  constructor(
    @Inject('ConcertRepository') private readonly concertRepository: ConcertRepository,
    @Inject('BookingRepository') private readonly bookingRepository: BookingRepository,
    @Inject('UnitOfWork') private readonly unitOfWork: UnitOfWork,
    @Inject('CachePort') private readonly cache: CachePort,
  ) {
    this.createConcertUseCase = new CreateConcertUseCase(
      concertRepository,
      cache,
    );
    this.reserveSeatUseCase = new ReserveSeatUseCase(
      concertRepository,
      bookingRepository,
      unitOfWork,
      cache,
    );
    this.cancelBookingUseCase = new CancelBookingUseCase(
      concertRepository,
      bookingRepository,
      unitOfWork,
      cache,
    );
  }

  async createConcert(input: {
    name: string;
    description?: string;
    totalSeats: number;
  }): Promise<Concert> {
    return this.createConcertUseCase.execute(input);
  }

  async getAllConcerts(): Promise<Concert[]> {
    // Try cache first
    const cacheKey = 'concerts:all';
    const cached = await this.cache.get<Concert[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const concerts = await this.concertRepository.findAll();

    // Cache for 5 minutes
    await this.cache.set(cacheKey, concerts, 300);

    return concerts;
  }

  async getConcertById(id: string): Promise<Concert | null> {
    const cacheKey = `concert:${id}`;
    const cached = await this.cache.get<Concert>(cacheKey);
    if (cached) {
      return cached;
    }

    const concert = await this.concertRepository.findById(id);
    if (concert) {
      await this.cache.set(cacheKey, concert, 300);
    }

    return concert;
  }

  async deleteConcert(id: string): Promise<void> {
    // Cancel all bookings for this concert before deleting
    await this.bookingRepository.cancelAllByConcertId(id);
    
    // Delete the concert
    await this.concertRepository.delete(id);
    
    // Invalidate cache
    await this.cache.invalidatePattern(`concert:${id}*`);
    await this.cache.invalidatePattern('concerts:*');
  }

  async reserveSeat(concertId: string, userId: string) {
    return this.reserveSeatUseCase.execute({ concertId, userId });
  }

  async cancelReservation(concertId: string, userId: string) {
    return this.cancelBookingUseCase.execute({ concertId, userId });
  }

}

@Injectable()
export class BookingService {
  constructor(
    @Inject('BookingRepository') private readonly bookingRepository: BookingRepository,
    @Inject('CachePort') private readonly cache: CachePort,
  ) {}

  async getUserBookings(userId: string) {
    return this.bookingRepository.findByUserId(userId);
  }

  async getAllBookings() {
    return this.bookingRepository.findAll();
  }

  async getUserBookingForConcert(concertId: string, userId: string) {
    return this.bookingRepository.findByConcertAndUser(concertId, userId);
  }
}

