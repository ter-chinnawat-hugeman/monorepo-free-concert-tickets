import { z } from 'zod';

// DTOs using Zod for validation

export const CreateConcertDtoSchema = z.object({
  name: z.string().min(1, 'Concert name is required'),
  description: z.string().optional(),
  totalSeats: z
    .number()
    .int()
    .positive('Total seats must be a positive integer'),
});

export type CreateConcertDto = {
  name: string;
  description?: string;
  totalSeats: number;
};

export const ReserveSeatDtoSchema = z.object({
  concertId: z.string().uuid('Invalid concert ID'),
});

export type ReserveSeatDto = z.infer<typeof ReserveSeatDtoSchema>;

export const CancelReservationDtoSchema = z.object({
  concertId: z.string().uuid('Invalid concert ID'),
});

export type CancelReservationDto = z.infer<typeof CancelReservationDtoSchema>;
