import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'refreshToken is required' })
  @IsString({ message: 'refreshToken must be tyepof string' })
  refreshToken: string;
}
