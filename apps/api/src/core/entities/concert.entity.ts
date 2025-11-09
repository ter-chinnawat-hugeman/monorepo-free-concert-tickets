// Core Domain Entity - Concert

export class Concert {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly totalSeats: number,
    public readonly reservedSeats: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null,
  ) {}

  get availableSeats(): number {
    return this.totalSeats - this.reservedSeats;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  canReserve(): boolean {
    return !this.isDeleted && this.reservedSeats < this.totalSeats;
  }

  reserveSeat(): Concert {
    if (!this.canReserve()) {
      throw new Error('No available seats');
    }
    return new Concert(
      this.id,
      this.name,
      this.description,
      this.totalSeats,
      this.reservedSeats + 1,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  cancelReservation(): Concert {
    if (this.reservedSeats <= 0) {
      throw new Error('No reserved seats to cancel');
    }
    return new Concert(
      this.id,
      this.name,
      this.description,
      this.totalSeats,
      this.reservedSeats - 1,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  softDelete(): Concert {
    if (this.isDeleted) {
      throw new Error('Concert already deleted');
    }
    return new Concert(
      this.id,
      this.name,
      this.description,
      this.totalSeats,
      this.reservedSeats,
      this.createdAt,
      new Date(),
      new Date(),
    );
  }
}
