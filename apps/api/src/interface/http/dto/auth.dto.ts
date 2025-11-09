import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export const LoginDtoSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}
export class LoginDto extends createZodDto(LoginDtoSchema) {}
