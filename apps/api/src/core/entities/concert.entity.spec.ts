import { Concert } from '../entities/concert.entity';

describe('Concert Entity', () => {
  const baseDate = new Date('2024-01-01');

  describe('availableSeats', () => {
    it('should calculate available seats correctly', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        30,
        baseDate,
        baseDate,
      );

      expect(concert.availableSeats).toBe(70);
    });

    it('should return 0 when fully booked', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        100,
        baseDate,
        baseDate,
      );

      expect(concert.availableSeats).toBe(0);
    });
  });

  describe('canReserve', () => {
    it('should return true when seats are available', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        50,
        baseDate,
        baseDate,
      );

      expect(concert.canReserve()).toBe(true);
    });

    it('should return false when fully booked', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        100,
        baseDate,
        baseDate,
      );

      expect(concert.canReserve()).toBe(false);
    });
  });

  describe('reserveSeat', () => {
    it('should create a new concert with incremented reserved seats', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        50,
        baseDate,
        baseDate,
      );

      const updated = concert.reserveSeat();

      expect(updated.reservedSeats).toBe(51);
      expect(updated.id).toBe(concert.id);
      expect(updated.name).toBe(concert.name);
      expect(updated.totalSeats).toBe(concert.totalSeats);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(baseDate.getTime());
    });

    it('should throw error when no seats available', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        100,
        baseDate,
        baseDate,
      );

      expect(() => concert.reserveSeat()).toThrow('No available seats');
    });
  });

  describe('cancelReservation', () => {
    it('should create a new concert with decremented reserved seats', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        50,
        baseDate,
        baseDate,
      );

      const updated = concert.cancelReservation();

      expect(updated.reservedSeats).toBe(49);
      expect(updated.id).toBe(concert.id);
      expect(updated.name).toBe(concert.name);
      expect(updated.totalSeats).toBe(concert.totalSeats);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(baseDate.getTime());
    });

    it('should throw error when no reserved seats', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        0,
        baseDate,
        baseDate,
      );

      expect(() => concert.cancelReservation()).toThrow('No reserved seats to cancel');
    });

    it('should throw error when reserved seats is negative', () => {
      const concert = new Concert(
        'concert-1',
        'Test Concert',
        'Description',
        100,
        -1,
        baseDate,
        baseDate,
      );

      expect(() => concert.cancelReservation()).toThrow('No reserved seats to cancel');
    });
  });
});

