// scripts/generate-swagger.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';

async function generateSwaggerJson() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('IAM API Documentation')
    .setDescription(
      `
      Comprehensive Identity and Access Management (IAM) API with role-based access control (RBAC).
      
      ## Features
      - User authentication with JWT tokens
      - Multi-role user support with role selection
      - Permission-based authorization (Route & Resource permissions)
      - Dynamic menu system based on user permissions
      - Refresh token mechanism
      
      ## Authentication Flow
      1. Sign up with role codes
      2. Sign in (if multiple roles, select one)
      3. Use access token in Bearer header
      4. Refresh tokens when expired
      
      ## Permission Types
      - **Route Permissions**: Control access to API endpoints
      - **Resource Permissions**: Control access to UI resources/menus
    `,
    )
    .setVersion('1.0')
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

  // Write to file
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  console.log('✅ Swagger JSON generated successfully at ./swagger-spec.json');

  // Also generate YAML if needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const yaml = require('js-yaml');
  fs.writeFileSync('./swagger-spec.yaml', yaml.dump(document));

  console.log('✅ Swagger YAML generated successfully at ./swagger-spec.yaml');

  await app.close();
}

generateSwaggerJson().catch((err) => {
  console.error('❌ Error generating Swagger spec:', err);
  process.exit(1);
});
