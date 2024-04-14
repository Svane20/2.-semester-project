import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The username',
    example: 'ks',
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'The password',
    example: 'test',
  })
  @IsNotEmpty()
  readonly password: string;
}
