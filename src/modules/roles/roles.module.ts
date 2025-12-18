import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/databases/database.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [DatabaseModule],
})
export class RolesModule {}
