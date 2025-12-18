import { IsString, IsUUID } from 'class-validator';

export class SelectRoleDto {
  @IsString({ message: 'RoleId must be a string' })
  @IsUUID(4, { message: 'RoleId must be valid uuid' })
  roleId: string;

  @IsString({ message: 'Exchange Token must be a string' })
  exchangeToken: string;
}
