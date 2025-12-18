import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new ConsoleLogger({
    prefix: 'ASM', // Default is "Nest"
  });
  const app = await NestFactory.create(AppModule, { logger: logger });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? [],
    methods: process.env.CORS_METHODS ?? 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('IAM API Documentation')
    .setDescription(
      `
      Comprehensive Auth system management API with role-based and claim-base access control (CBAC | RBAC).
      
      ## Features
      - User authentication with JWT tokens
      - Multi-role user support with role selection
      - Permission-based authorization (Route & Resource permissions)
      - Dynamic menu system based on user permissions
      - Refresh token mechanism
      
      ## Authentication Flow
      1. Sign up with role codes
      2. Sign in (if has multiple roles, select role first before access resources)
      3. Use access token in Bearer header
      4. Refresh tokens when expired
      
      ## Permission Types
      - **Route Permissions**: Control access to API endpoints
      - **Resource Permissions**: Control access to per data resources (eg, resources on menus)
    `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role management and assignment endpoints')
    .addTag('Permissions', 'Permission management and assignment endpoints')
    .addTag('Menus', 'Menu management and user menu retrieval')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  logger.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  logger.log(
    `📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api-docs`,
  );
}

bootstrap();
