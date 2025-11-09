import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { BookingService } from '../../../application/services/concert.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../../core/entities/user.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('me')
  @Roles(UserRole.USER) 
  async getMyBookings(@Req() req: any) {
    const bookings = await this.bookingService.getUserBookings(req.user.id);
    return bookings.map(b => ({
      id: b.id,
      concertId: b.concertId,
      userId: b.userId,
      status: b.status,
      createdAt: b.createdAt,
    }));
  }

  @Get()
  @Roles(UserRole.ADMIN) 
  async getAllBookings(@Req() req: any) {
    const bookings = await this.bookingService.getAllBookings();
    return bookings.map(b => ({
      id: b.id,
      concertId: b.concertId,
      userId: b.userId,
      status: b.status,
      createdAt: b.createdAt,
    }));
  }
}

