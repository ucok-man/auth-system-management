import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { CoffeesModule } from './modules/coffees/coffees.module';
import { IamModule } from './modules/iam/iam.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CoffeesModule,
    UsersModule,
    IamModule,
  ],
  providers: [],
})
export class AppModule {}
