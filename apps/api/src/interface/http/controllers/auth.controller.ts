import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../../../application/services/auth.service';
import { RegisterDto, LoginDto, RegisterDtoSchema, LoginDtoSchema } from '../dto/auth.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { Public } from '../guards/jwt-auth.guard';
import { UserRole } from '../../../core/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) dto: RegisterDto,
  ) {
    const role = dto.role ? (dto.role as UserRole) : UserRole.USER;
    return this.authService.register(dto.username, dto.password, role);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(LoginDtoSchema)) dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }
}

