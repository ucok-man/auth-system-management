import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ResourcePermissions } from '../iam/decorators/resources-permission.decorator';
import type { ActiveUserPayload } from '../iam/interfaces/active-user-payload.interface';
import type { ResourcePermissionPayload } from '../iam/interfaces/permission-payload.interface';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RoutePermission(RoutePermissionCode.UserCreate)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @RoutePermission(RoutePermissionCode.UserRead)
  @Get()
  findAll(
    @ActiveUser() session: ActiveUserPayload,
    @ResourcePermissions() resourcePermissions: ResourcePermissionPayload,
  ) {
    console.log({ session });
    console.log({ resourcePermissions });

    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // @RoutePermission(RoutePermissionCode.UserEdit)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
