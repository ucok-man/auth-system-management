import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique role code (lowercase letters only)',
    example: 'admin',
  })
  @IsString({ message: 'code must be a string' })
  @IsNotEmpty({ message: 'code is required' })
  @IsLowercase({ message: 'code must be lowercase' })
  @IsAlpha('en-US', { message: 'code must contain only letters (a–z)' })
  code: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Administrator',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Role description (max 255 characters)',
    example: 'System administrator with full access',
    maxLength: 255,
  })
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, {
    message: 'description must not exceed 255 characters',
  })
  description?: string;
}
