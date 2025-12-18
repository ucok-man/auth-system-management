import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'UUID of the permission to assign',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
  })
  @IsString({ message: 'permissionId must be a string' })
  @IsNotEmpty({ message: 'permissionId is required' })
  @IsUUID('4', { message: 'permissionId must be a valid UUID' })
  permissionId: string;

  @ApiProperty({
    description: 'UUID of the role to assign permission to',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  roleId: string;
}
