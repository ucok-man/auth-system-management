import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SelectRoleDto {
  @IsString({ message: 'roleId must be a string' })
  @IsNotEmpty({ message: 'roleId is required' })
  @IsUUID(4, { message: 'roleId must be valid uuid' })
  roleId: string;

  @IsString({ message: 'exchangeToken must be a string' })
  exchangeToken: string;
}
