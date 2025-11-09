import { Module } from '@nestjs/common';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../../../application/services/concert.service';
import { PrismaBookingRepository } from '../../../infrastructure/repositories/prisma-repositories';
import { RedisCacheAdapter } from '../../../infrastructure/cache/redis-cache.adapter';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    PrismaService,
    {
      provide: 'BookingRepository',
      useClass: PrismaBookingRepository,
    },
    {
      provide: 'CachePort',
      useClass: RedisCacheAdapter,
    },
  ],
  exports: [BookingService],
})
export class BookingModule {}

