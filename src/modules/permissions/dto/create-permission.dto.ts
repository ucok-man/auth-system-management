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
  @IsString({ message: 'code must be a string' })
  @IsNotEmpty({ message: 'code is required' })
  @IsLowercase({ message: 'code must be lowercase' })
  @IsAlpha('en-US', { message: 'code must contain only letters (a–z)' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message: 'code must be in format <rolecode>:<action> (lowercase)',
  })
  code: string;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, {
    message: 'description must not exceed 255 characters',
  })
  description?: string;
}
