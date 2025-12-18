import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsString({ message: 'RoleId must be a string' })
  @IsNotEmpty({ message: 'RoleId is required' })
  @IsUUID('4', { message: 'RoleId must be a valid UUID' })
  roleId: string;

  @IsString({ message: 'UserId must be a string' })
  @IsNotEmpty({ message: 'UserId is required' })
  @IsUUID('4', { message: 'UserId must be a valid UUID' })
  userId: string;
}
