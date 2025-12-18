import { Controller, Get } from '@nestjs/common';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RoutePermission(RoutePermissionCode.UserRead)
  @Get()
  async findAll() {
    const { users } = await this.usersService.findAll();
    return { data: users };
  }
}
