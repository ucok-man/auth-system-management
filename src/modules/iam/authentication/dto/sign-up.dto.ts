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
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @IsAlpha('en-US', { message: 'Name code must contain only letters (a–z)' })
  name: string;

  @IsString({ message: 'Email must be string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and number/special character',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  @IsUrl({}, { message: 'Image must be valid url' })
  image?: string;

  @IsArray({ message: 'Role codes must be an array' })
  @IsString({ each: true, message: 'Each role code must be a string' })
  @IsLowercase({ each: true, message: 'Each role code must be lowercase' })
  roleCodes: string[];
}
