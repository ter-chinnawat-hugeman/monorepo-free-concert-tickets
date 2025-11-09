import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UnitOfWork } from '../../core/ports';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async begin(): Promise<void> {}

  async commit(): Promise<void> {}

  async rollback(): Promise<void> {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return fn();
    });
  }
}
