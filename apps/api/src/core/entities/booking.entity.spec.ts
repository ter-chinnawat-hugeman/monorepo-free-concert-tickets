import { Booking, BookingStatus } from '../entities/booking.entity';

describe('Booking Entity', () => {
  const baseDate = new Date('2024-01-01');

  describe('cancel', () => {
    it('should create a new booking with CANCELED status', () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.RESERVED,
        baseDate,
        baseDate,
      );

      const canceled = booking.cancel();

      expect(canceled.status).toBe(BookingStatus.CANCELED);
      expect(canceled.id).toBe(booking.id);
      expect(canceled.concertId).toBe(booking.concertId);
      expect(canceled.userId).toBe(booking.userId);
      expect(canceled.createdAt).toBe(booking.createdAt);
      expect(canceled.updatedAt.getTime()).toBeGreaterThan(baseDate.getTime());
    });

    it('should throw error when booking is already canceled', () => {
      const booking = new Booking(
        'booking-1',
        'concert-1',
        'user-1',
        BookingStatus.CANCELED,
        baseDate,
        baseDate,
      );

      expect(() => booking.cancel()).toThrow('Booking already canceled');
    });
  });
});

