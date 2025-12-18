import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  roleId: string;

  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;
}
