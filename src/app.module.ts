import { Module } from '@nestjs/common';

import { CoffeesModule } from './coffees/coffees.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CoffeesModule, UsersModule],
  providers: [PrismaService],
})
export class AppModule {}
