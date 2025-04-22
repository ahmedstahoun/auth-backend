import { IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/, {
    message: 'Password must include at least one letter, one number, and one special character',
  })
  password: string;
}
