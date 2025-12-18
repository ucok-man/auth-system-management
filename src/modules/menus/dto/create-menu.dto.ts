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
  @IsString({ message: 'Slug must be a string' })
  slug: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Icon must be a string' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'Href must be a string' })
  @IsUrl({}, { message: 'Href must be a valid URL' })
  href?: string;

  @IsOptional()
  @IsArray({ message: 'Resource permissions must be an array of strings' })
  @ArrayUnique({ message: 'Resource permissions must not contain duplicates' })
  @Matches(/^[a-z0-9_.-]+:[a-z0-9_.-]+$/, {
    each: true,
    message:
      'Each resource permission must be in format <rolecode>:<action> (lowercase)',
  })
  resourcePermissions?: string[];

  @IsOptional()
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  parentId?: string;
}
