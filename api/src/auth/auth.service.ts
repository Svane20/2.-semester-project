import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { SignUpDto } from './dto/SignUpDto';
import { LoginDto } from './dto/LoginDto';
import { AuthenticatedUser } from './models/authenticated-user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthenticatedUser> {
    const user = await this.usersService.getUserByUsername(loginDto.username);

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      return this.convertToDto(user);
    }

    throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthenticatedUser> {
    const user = await this.usersService.createUser(
      signUpDto.username,
      signUpDto.password,
    );

    return this.convertToDto(user);
  }

  private convertToDto(user: User): AuthenticatedUser {
    const userTo = this.usersService.convertToDto(user);

    return {
      userId: userTo.userId,
      username: userTo.username,
      accessToken: this.jwtService.sign({
        username: user.username,
      }),
    };
  }
}
