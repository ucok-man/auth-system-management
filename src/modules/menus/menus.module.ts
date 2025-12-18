import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/databases/database.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  imports: [DatabaseModule],
})
export class MenusModule {}
