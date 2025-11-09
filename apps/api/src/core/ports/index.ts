import { Concert } from '../entities/concert.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { User } from '../entities/user.entity';

export interface ConcertRepository {
  findById(id: string): Promise<Concert | null>;
  findAll(): Promise<Concert[]>;
  create(concert: Omit<Concert, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Concert>;
  update(concert: Concert): Promise<Concert>;
  delete(id: string): Promise<void>;
}


export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByConcertAndUser(concertId: string, userId: string): Promise<Booking | null>;
  findByConcertId(concertId: string): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  findAll(): Promise<Booking[]>;
  create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  cancelAllByConcertId(concertId: string): Promise<void>;
}


export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isAdmin'>): Promise<User>;
  update(user: User): Promise<User>;
}

export interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  execute<T>(fn: () => Promise<T>): Promise<T>;
}

