// Core Domain Entity - User

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly salt: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}

