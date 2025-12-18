import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/databases/database.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [DatabaseModule],
})
export class PermissionsModule {}
