import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './auhtentication.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth.type.enum';

@Auth(AuthType.None)
@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  async signup(@Body() dto: SignUpDto) {
    const { user } = await this.authService.signup(dto);
    return { data: user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  async signin(@Body() dto: SignInDto) {
    const { accessToken, refreshToken } = await this.authService.signin(dto);
    return { accessToken, refreshToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh-tokens')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.authService.refreshToken(dto);

    return { accessToken, refreshToken };
  }
}
