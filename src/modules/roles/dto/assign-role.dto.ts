import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsString({ message: 'Role ID must be a string' })
  @IsNotEmpty({ message: 'Role ID is required' })
  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  roleId: string;

  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;
}
