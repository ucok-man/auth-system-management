import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Unique menu slug',
    example: 'dashboard',
  })
  @IsString({ message: 'slug must be a string' })
  slug: string;

  @ApiProperty({
    description: 'Menu display name',
    example: 'Dashboard',
  })
  @IsString({ message: 'name must be a string' })
  name: string;

  @ApiPropertyOptional({
    description: 'Menu icon name or class',
    example: 'dashboard-icon',
  })
  @IsOptional()
  @IsString({ message: 'icon must be a string' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Menu navigation URL',
    example: 'https://example.com/dashboard',
  })
  @IsOptional()
  @IsString({ message: 'href must be a string' })
  @IsUrl({}, { message: 'href must be a valid URL' })
  href?: string;

  @ApiPropertyOptional({
    description:
      'Array of resource permissions required to access this menu (format: <rolecode>:<action>)',
    example: ['user:read', 'admin:create'],
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'resourcePermissions must be an array of strings' })
  @ArrayUnique({ message: 'resourcePermissions must not contain duplicates' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message:
      'resourcePermissions each item must be in format <rolecode>:<action> (lowercase)',
  })
  resourcePermissions?: string[];

  @ApiPropertyOptional({
    description: 'UUID of parent menu (for nested menus)',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'parentId must be a valid UUID' })
  parentId?: string;
}
