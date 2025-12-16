import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuhtenticationService } from './auhtentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('/auth')
export class AuhtenticationController {
  constructor(private readonly authService: AuhtenticationService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  async signup(@Body() dto: SignUpDto) {
    const user = await this.authService.signup(dto);
    return { data: user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  async signin(@Body() dto: SignInDto) {
    const user = await this.authService.signin(dto);
    return { data: user };
  }
}
