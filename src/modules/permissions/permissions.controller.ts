import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RoutePermission(RoutePermissionCode.PermissionCreate)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const { permission } =
      await this.permissionsService.create(createPermissionDto);
    return { data: permission };
  }

  @RoutePermission(RoutePermissionCode.PermissionEdit)
  @HttpCode(HttpStatus.OK)
  @Post('/assign')
  async assing(@Body() dto: AssignPermissionDto) {
    const { roleId, assignedPermission } =
      await this.permissionsService.assignPermission(dto);

    return { data: { roleId, assignedPermission } };
  }

  @RoutePermission(RoutePermissionCode.PermissionRead)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    const { permissions } = await this.permissionsService.findAll();
    return { data: permissions };
  }
}
