import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsString({ message: 'email must be string' })
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
    maxLength: 32,
  })
  @IsString({ message: 'password must be string' })
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(32, { message: 'password must not exceed 32 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain uppercase, lowercase, and number/special character',
  })
  password: string;
}
