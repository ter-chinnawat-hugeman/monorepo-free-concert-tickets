import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Concert } from '../../core/entities/concert.entity';
import { Booking, BookingStatus } from '../../core/entities/booking.entity';
import { User } from '../../core/entities/user.entity';
import { ConcertRepository, BookingRepository, UserRepository } from '../../core/ports';

@Injectable()
export class PrismaConcertRepository implements ConcertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Concert | null> {
    const data = await this.prisma.concert.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!data) return null;

    return this.toDomain(data);
  }

  async findAll(): Promise<Concert[]> {
    const data = await this.prisma.concert.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(
    concert: Omit<Concert, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Concert> {
    const data = await this.prisma.concert.create({
      data: {
        name: concert.name,
        description: concert.description,
        totalSeats: concert.totalSeats,
        reservedSeats: concert.reservedSeats,
      },
    });

    return this.toDomain(data);
  }

  async update(concert: Concert): Promise<Concert> {
    const data = await this.prisma.concert.update({
      where: { id: concert.id },
      data: {
        name: concert.name,
        description: concert.description,
        totalSeats: concert.totalSeats,
        reservedSeats: concert.reservedSeats,
        updatedAt: new Date(),
        deletedAt: concert.deletedAt,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    // Soft delete: set deletedAt timestamp
    await this.prisma.concert.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(data: any): Concert {
    return new Concert(
      data.id,
      data.name,
      data.description,
      data.totalSeats,
      data.reservedSeats,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }
}

@Injectable()
export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Booking | null> {
    const data = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!data) return null;

    return this.toDomain(data);
  }

  async findByConcertAndUser(
    concertId: string,
    userId: string,
  ): Promise<Booking | null> {
    const data = await this.prisma.booking.findUnique({
      where: {
        concertId_userId: {
          concertId,
          userId,
        },
      },
    });

    if (!data) return null;

    return this.toDomain(data);
  }

  async findByConcertId(concertId: string): Promise<Booking[]> {
    const data = await this.prisma.booking.findMany({
      where: { concertId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const data = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        concert: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAll(): Promise<Booking[]> {
    const data = await this.prisma.booking.findMany({
      include: {
        concert: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(
    booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Booking> {
    const data = await this.prisma.booking.create({
      data: {
        concertId: booking.concertId,
        userId: booking.userId,
        status: booking.status,
      },
    });

    return this.toDomain(data);
  }

  async update(booking: Booking): Promise<Booking> {
    const data = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: booking.status,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(data);
  }

  async cancelAllByConcertId(concertId: string): Promise<void> {
    await this.prisma.booking.updateMany({
      where: {
        concertId,
        status: BookingStatus.RESERVED,
      },
      data: {
        status: BookingStatus.CANCELED,
        updatedAt: new Date(),
      },
    });
  }

  private toDomain(data: any): Booking {
    return new Booking(
      data.id,
      data.concertId,
      data.userId,
      data.status as BookingStatus,
      data.createdAt,
      data.updatedAt,
    );
  }
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!data) return null;

    return this.toDomain(data);
  }

  async findByUsername(username: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!data) return null;

    return this.toDomain(data);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        username: user.username,
        passwordHash: user.passwordHash,
        salt: user.salt,
        role: user.role,
      },
    });

    return this.toDomain(data);
  }

  async update(user: User): Promise<User> {
    const data = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        passwordHash: user.passwordHash,
        salt: user.salt,
        role: user.role,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(data);
  }

  private toDomain(data: any): User {
    return new User(
      data.id,
      data.username,
      data.passwordHash,
      data.salt,
      data.role,
      data.createdAt,
      data.updatedAt,
    );
  }
}

