import {
  IsAlpha,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePermissionDto {
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @IsLowercase({ message: 'Code must be lowercase' })
  @IsAlpha('en-US', { message: 'Code must contain only letters (a–z)' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message: 'Code must be in format <rolecode>:<action> (lowercase)',
  })
  code: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(255, {
    message: 'Description must not exceed 255 characters',
  })
  description?: string;
}
