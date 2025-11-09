import { Module } from '@nestjs/common';
import { ConcertModule } from './interface/http/modules/concert.module';
import { BookingModule } from './interface/http/modules/booking.module';
import { AuthModule } from './interface/http/modules/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    AuthModule,
    ConcertModule,
    BookingModule,
  ],
})
export class AppModule {}
