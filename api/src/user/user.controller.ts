import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserTo } from './models/userTo';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  async getUsers(): Promise<UserTo[]> {
    const users = await this.usersService.getUsers();

    if (users.length === 0) {
      return [];
    }

    return users.map((user) => this.usersService.convertToDto(user));
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserTo> {
    const user = await this.usersService.getUserById(id);

    if (user === null) {
      throw new HttpException(
        `User with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.usersService.convertToDto(user);
  }
}
