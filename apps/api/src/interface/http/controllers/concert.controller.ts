import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConcertService, BookingService } from '../../../application/services/concert.service';
import { CreateConcertDto, CreateConcertDtoSchema } from '../dto/concert.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../../core/entities/user.entity';

@Controller('concerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConcertController {
  constructor(
    private readonly concertService: ConcertService,
    private readonly bookingService: BookingService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER) 
  async findAll(@Req() req: any) {
    const concerts = await this.concertService.getAllConcerts();
    
    // For user view, include booking status
    if (req.user.role === UserRole.USER) {
      const userId = req.user.id;
      const concertsWithBookingStatus = await Promise.all(
        concerts.map(async (concert) => {
          const booking = await this.bookingService.getUserBookingForConcert(
            concert.id,
            userId,
          );
          return {
            id: concert.id,
            name: concert.name,
            description: concert.description,
            totalSeats: concert.totalSeats,
            reservedSeats: concert.reservedSeats,
            availableSeats: concert.availableSeats,
            isReserved: booking?.status === 'RESERVED',
            bookingId: booking?.id,
          };
        }),
      );
      return concertsWithBookingStatus;
    }

    return concerts.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      totalSeats: c.totalSeats,
      reservedSeats: c.reservedSeats,
      availableSeats: c.availableSeats,
    }));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER) 
  async findOne(@Param('id') id: string) {
    const concert = await this.concertService.getConcertById(id);
    if (!concert) {
      throw new Error('Concert not found');
    }
    return {
      id: concert.id,
      name: concert.name,
      description: concert.description,
      totalSeats: concert.totalSeats,
      reservedSeats: concert.reservedSeats,
      availableSeats: concert.availableSeats,
    };
  }

  @Post()
  @Roles(UserRole.ADMIN) 
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateConcertDtoSchema)) dto: CreateConcertDto,
  ) {
    const concert = await this.concertService.createConcert(dto);
    return {
      id: concert.id,
      name: concert.name,
      description: concert.description,
      totalSeats: concert.totalSeats,
      reservedSeats: concert.reservedSeats,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) 
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.concertService.deleteConcert(id);
  }

  @Post(':id/reserve')
  @Roles(UserRole.USER) 
  @HttpCode(HttpStatus.CREATED)
  async reserve(@Param('id') concertId: string, @Req() req: any) {
    const booking = await this.concertService.reserveSeat(concertId, req.user.id);
    return {
      id: booking.id,
      concertId: booking.concertId,
      userId: booking.userId,
      status: booking.status,
    };
  }

  @Post(':id/cancel')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') concertId: string, @Req() req: any) {
    const booking = await this.concertService.cancelReservation(concertId, req.user.id);
    return {
      id: booking.id,
      concertId: booking.concertId,
      userId: booking.userId,
      status: booking.status,
    };
  }
}

