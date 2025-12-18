import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsArray,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'User full name (letters only, 2-255 characters)',
    example: 'John',
    minLength: 2,
    maxLength: 255,
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(255, { message: 'name must not exceed 255 characters' })
  @IsAlpha('en-US', { message: 'name code must contain only letters (a–z)' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsString({ message: 'email must be string' })
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be valid email address' })
  email: string;

  @ApiProperty({
    description:
      'Password (8-32 chars, must contain uppercase, lowercase, and number/special character)',
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

  @ApiPropertyOptional({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: 'image must be a string' })
  @IsUrl({}, { message: 'image must be valid url' })
  image?: string;

  @ApiProperty({
    description: 'Array of role codes (lowercase) to assign to user',
    example: ['admin', 'user'],
    isArray: true,
    type: [String],
  })
  @IsArray({ message: 'roleCodes must be an array' })
  @IsString({ each: true, message: 'roleCodes each item must be a string' })
  @IsLowercase({ each: true, message: 'roleCodes each item must be lowercase' })
  roleCodes: string[];
}
