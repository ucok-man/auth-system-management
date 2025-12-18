import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsString({ message: 'permissionId must be a string' })
  @IsNotEmpty({ message: 'permissionId is required' })
  @IsUUID('4', { message: 'permissionId must be a valid UUID' })
  permissionId: string;

  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  roleId: string;
}
