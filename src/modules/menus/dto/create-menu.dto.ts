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
  @IsString({ message: 'slug must be a string' })
  slug: string;

  @IsString({ message: 'name must be a string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'icon must be a string' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'href must be a string' })
  @IsUrl({}, { message: 'href must be a valid URL' })
  href?: string;

  @IsOptional()
  @IsArray({ message: 'resourcePermissions must be an array of strings' })
  @ArrayUnique({ message: 'resourcePermissions must not contain duplicates' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message:
      'resourcePermissions each item must be in format <rolecode>:<action> (lowercase)',
  })
  resourcePermissions?: string[];

  @IsOptional()
  @IsUUID('4', { message: 'parentId must be a valid UUID' })
  parentId?: string;
}
