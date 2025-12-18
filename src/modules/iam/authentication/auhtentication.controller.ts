import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './auhtentication.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SelectRoleDto } from './dto/select-role.dto';
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
    const { user, roles } = await this.authService.signup(dto);
    return { data: { user, roles } };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  async signin(@Body() dto: SignInDto) {
    const { requireRoleSelection, ...rest } =
      await this.authService.signin(dto);

    if (requireRoleSelection) {
      const { availableRoles, user, ...other } = rest;
      return {
        data: { user: user, availableRoles: availableRoles },
        requireRoleSelection: requireRoleSelection,
        ...other,
      };
    }

    const { role, user, ...other } = rest;
    return {
      data: { user: user, role: role },
      requireRoleSelection: requireRoleSelection,
      ...other,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/select-role')
  async selectRole(@Body() dto: SelectRoleDto) {
    const { user, role, ...rest } = await this.authService.selectRole(dto);
    return { data: { user, role }, ...rest };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh-tokens')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.authService.refreshToken(dto);

    return { accessToken, refreshToken };
  }
}
