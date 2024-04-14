import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { SignUpDto } from './dto/SignUpDto';
import { AuthenticatedUser } from './models/authenticated-user';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthenticatedUser> {
    return this.authService.login(loginDto);
  }

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthenticatedUser> {
    return this.authService.signUp(signUpDto);
  }
}
