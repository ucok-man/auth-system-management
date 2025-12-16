import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true, // strip properties not in the DTO
      forbidNonWhitelisted: true, // throw error if extra properties are present
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
