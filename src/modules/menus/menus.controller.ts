import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { ResourcePermissions } from '../iam/decorators/resources-permission.decorator';
import type { ResourcePermissionPayload } from '../iam/interfaces/permission-payload.interface';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenusService } from './menus.service';

@Controller('/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @HttpCode(HttpStatus.CREATED)
  @RoutePermission(RoutePermissionCode.MenuCreate)
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    const { menu } = await this.menusService.create(dto);
    return { data: menu };
  }

  @HttpCode(HttpStatus.OK)
  @RoutePermission(RoutePermissionCode.MenuRead)
  @Get('/my-menus')
  async myMenus(
    @ResourcePermissions() resourcePermissions: ResourcePermissionPayload,
  ) {
    const { menus } = await this.menusService.findMyMenus({
      resourcePermissions: resourcePermissions,
    });
    return { data: menus };
  }
}
