import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserTo } from './models/userTo';

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.seedUsers().then(() => {});
  }

  public getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public getUserById(userId: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        userId,
      },
    });
  }

  public getUserByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }

  public async createUser(username: string, password: string): Promise<User> {
    const user = await this.getUserByUsername(username);
    if (user?.username === username) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userToBeCreated: UserTo = {
      userId: this.generateGUID(),
      username,
      password: hashedPassword,
    };

    return await this.usersRepository.save(userToBeCreated);
  }

  public convertToDto(user: User): UserTo {
    return {
      userId: user.userId,
      username: user.username,
    };
  }

  private async seedUsers(): Promise<void> {
    const users = await this.usersRepository.find();

    if (users.length === 0) {
      console.log('Seeding user to database');

      await this.createUser('ks', 'test');

      console.log('User seeded to database');
    }
  }

  private generateGUID(): string {
    return uuidv4();
  }
}
