import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'UUID of the role to assign',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  roleId: string;

  @ApiProperty({
    description: 'UUID of the user to assign role to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;
}
