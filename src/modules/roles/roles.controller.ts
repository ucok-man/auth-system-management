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
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RoutePermission(RoutePermissionCode.RoleCreate)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const { role } = await this.rolesService.create(dto);
    return { data: role };
  }

  @RoutePermission(RoutePermissionCode.RoleEdit)
  @HttpCode(HttpStatus.OK)
  @Post()
  async assignRole(@Body() dto: AssignRoleDto) {
    const { allRoles, assignedRole, userId } =
      await this.rolesService.assignRole(dto);

    return { data: { allRoles, assignedRole, userId } };
  }

  @RoutePermission(RoutePermissionCode.RoleRead)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    const { roles } = await this.rolesService.findAll();
    return { data: roles };
  }
}
