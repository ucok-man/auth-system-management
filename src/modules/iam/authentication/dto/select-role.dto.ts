import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SelectRoleDto {
  @ApiProperty({
    description: 'UUID of the role to select',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID(4, { message: 'roleId must be valid uuid' })
  roleId: string;

  @ApiProperty({
    description:
      'Exchange token received from sign-in response (for users with multiple roles)',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
  })
  @IsString({ message: 'exchangeToken must be a string' })
  exchangeToken: string;
}
