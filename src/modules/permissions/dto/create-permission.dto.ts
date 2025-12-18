import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description:
      'Permission code in format <rolecode>:<action> (lowercase). Actions: create, read, update, delete',
    example: 'user:read',
    pattern: '^[a-z0-9_.-]+:[a-z0-9_.-]+$',
  })
  @IsString({ message: 'code must be a string' })
  @IsNotEmpty({ message: 'code is required' })
  @IsLowercase({ message: 'code must be lowercase' })
  @IsAlpha('en-US', { message: 'code must contain only letters (a–z)' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message: 'code must be in format <rolecode>:<action> (lowercase)',
  })
  code: string;

  @ApiProperty({
    description: 'Permission display name',
    example: 'Read Users',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Permission description (max 255 characters)',
    example: 'Allows viewing user data',
    maxLength: 255,
  })
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, {
    message: 'description must not exceed 255 characters',
  })
  description?: string;
}
