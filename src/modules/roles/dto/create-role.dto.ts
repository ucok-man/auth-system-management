import {
  IsAlpha,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Role code must be a string' })
  @IsNotEmpty({ message: 'Role code is required' })
  @IsLowercase({ message: 'Role code must be lowercase' })
  @IsAlpha('en-US', { message: 'Role code must contain only letters (a–z)' })
  code: string;

  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsString({ message: 'Role description must be a string' })
  @IsOptional()
  @MaxLength(255, {
    message: 'Role description must not exceed 255 characters',
  })
  description?: string;
}
