import { Module } from '@nestjs/common';
import { ConcertController } from '../controllers/concert.controller';
import { ConcertService, BookingService } from '../../../application/services/concert.service';
import { PrismaConcertRepository, PrismaBookingRepository } from '../../../infrastructure/repositories/prisma-repositories';
import { RedisCacheAdapter } from '../../../infrastructure/cache/redis-cache.adapter';
import { PrismaUnitOfWork } from '../../../infrastructure/database/prisma-unit-of-work';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BookingModule } from './booking.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [BookingModule, AuthModule],
  controllers: [ConcertController],
  providers: [
    ConcertService,
    PrismaService,
    {
      provide: 'ConcertRepository',
      useClass: PrismaConcertRepository,
    },
    {
      provide: 'BookingRepository',
      useClass: PrismaBookingRepository,
    },
    {
      provide: 'CachePort',
      useClass: RedisCacheAdapter,
    },
    {
      provide: 'UnitOfWork',
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [ConcertService],
})
export class ConcertModule {}

