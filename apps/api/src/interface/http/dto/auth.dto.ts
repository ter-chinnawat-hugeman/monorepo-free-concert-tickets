import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must not exceed 100 characters'),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export const LoginDtoSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must not exceed 100 characters'),
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}
export class LoginDto extends createZodDto(LoginDtoSchema) {}
