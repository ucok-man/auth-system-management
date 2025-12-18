import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SelectRoleDto {
  @IsString({ message: 'Role Id must be a string' })
  @IsNotEmpty({ message: 'Role Id is required' })
  @IsUUID(4, { message: 'Role Id must be valid uuid' })
  roleId: string;

  @IsString({ message: 'Exchange Token must be a string' })
  exchangeToken: string;
}
