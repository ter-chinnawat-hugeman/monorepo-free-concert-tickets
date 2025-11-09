// Core Domain Entity - Booking

export enum BookingStatus {
  RESERVED = 'RESERVED',
  CANCELED = 'CANCELED',
}

export class Booking {
  constructor(
    public readonly id: string,
    public readonly concertId: string,
    public readonly userId: string,
    public readonly status: BookingStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  cancel(): Booking {
    if (this.status === BookingStatus.CANCELED) {
      throw new Error('Booking already canceled');
    }
    return new Booking(
      this.id,
      this.concertId,
      this.userId,
      BookingStatus.CANCELED,
      this.createdAt,
      new Date(),
    );
  }
}

