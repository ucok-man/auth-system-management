# Auth System Management API | Technical Test PT Data Integrasi Inovasi

A comprehensive authentication and authorization system built with NestJS, featuring role-based access control (RBAC) and claim-based access control (CBAC) with JWT token management.

## Features

- **User Authentication**: Secure JWT-based authentication with access and refresh tokens
- **Multi-Role Support**: Users can have multiple roles with dynamic role selection
- **Permission System**: Fine-grained permission control with Route and Resource permissions
- **Dynamic Menu System**: Menu visibility based on user resource permissions
- **Token Refresh**: Automatic token refresh mechanism with Redis storage
- **Exchange Token**: Secure role selection for multi-role users
- **OpenAPI Documentation**: Interactive Swagger UI for API exploration

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 17 (with Prisma ORM)
- **Cache**: Redis (for refresh token storage)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Validation**: class-validator
- **API Documentation**: Swagger/OpenAPI

## Database Schema

The system uses database schema with the following entities:

![Database ERD](docs/erd-diagram.png)

### Entity Relationships

- **User ↔ Role**: Many-to-many relationship via `UserRole` junction table
- **Role ↔ Permission**: Many-to-many relationship via `RolePermission` junction table
- **User ↔ Verification**: One-to-many relationship for token verification
- **Menu**: Self-referencing hierarchy with `parentId` for nested menus
- **Menu Permissions**: Stored as array of permission codes (not relational)

### Permission Types

1. **Route Permissions**: Control access to API endpoints (format: `<resource>:<action>`)
2. **Resource Permissions**: Control access to data resources (format: `<rolecode>:<action>`)

### Verification Scopes

- `SelectRole`: Used for exchange tokens when users have multiple roles

## Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager
- Docker and Docker Compose

## Quick Start

> Make sure your docker is running first

### 1. Clone the Repository

```bash
git clone git@github.com:ucok-man/auth-system-management.git
cd auth-system-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Application
PORT=3000
NODE_ENV=development

# PostgreSQL Database
POSTGRES_URL="postgresql://username:password@localhost:5432/auth_system?schema=public"
POSTGRES_MAX_OPEN_CONN=25
POSTGRES_MIN_IDLE_CONN=15
POSTGRES_MAX_IDLE_TIME_SECOND=900
POSTGRES_MAX_CONN_TIMEOUT_SECOND=3

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true
```

### 4. Start Database

Make sure Docker is running:

```bash
# Using Docker Compose
npm run db:up
```

### 4. Set Up Database

Run Prisma migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed the database
npm run prisma:seed

# All dummy user can be see on prisma/seed.ts file.
```

### 6. Start the Application

For development:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000` if using default port

## API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:3000/api-docs

## Available Endpoints

### Authentication

- `POST /auth/sign-up` - Register new user with roles
- `POST /auth/sign-in` - Authenticate user (returns tokens or exchange token)
- `POST /auth/select-role` - Select role for multi-role users
- `POST /auth/refresh-tokens` - Refresh access token

### Users

- `GET /users` - Get all users (requires `user:read` permission)

### Roles

- `POST /roles` - Create new role (requires `role:create` permission)
- `GET /roles` - Get all roles (requires `role:read` permission)
- `POST /roles/assign` - Assign role to user (requires `role:edit` permission)

### Permissions

- `POST /permissions` - Create new permission (requires `permission:create` permission)
- `GET /permissions` - Get all permissions (requires `permission:read` permission)
- `POST /permissions/assign` - Assign permission to role (requires `permission:edit` permission)

### Menus

- `POST /menus` - Create new menu (requires `menu:create` permission)
- `GET /menus/my-menus` - Get user's accessible menus (requires `menu:read` permission)

## Authentication Flow

### Single Role User

```mermaid
sequenceDiagram
    participant Client
    participant API

    Client->>API: POST /auth/sign-in
    Client->>API: POST/auth/refresh-tokens
```

### Multi-Role User

```mermaid
sequenceDiagram
    participant Client
    participant API

    Client->>API: POST /auth/sign-in
    Client->>API: POST /auth/select-role
    Client->>API: POST/auth/refresh-tokens
```

## Permission System

### Permission Code Format

- **Route Permissions**: `<resource>:<action>` (e.g., `user:read`, `menu:create`)
- **Resource Permissions**: `<rolecode>:<action>` (e.g., `admin:read`, `user:update`)

### Supported Actions

- `create` - Create new resources
- `read` - View/read resources
- `update` - Modify existing resources
- `delete` - Delete resources

### Example: Creating and Assigning Permissions

```bash
# 1. Create a permission
POST /permissions
{
  "code": "user:read",
  "name": "Read Users",
  "description": "Allows viewing user data"
}

# 2. Assign permission to role
POST /permissions/assign
{
  "permissionId": "permission-uuid",
  "roleId": "role-uuid"
}
```

## Security Considerations

- **Password Storage**: All passwords are hashed using bcrypt with salt
- **JWT Tokens**: Short-lived access tokens (1 hour) with refresh tokens (24 hours)
- **Token Storage**: Refresh tokens stored in Redis with user-specific keys
- **Exchange Tokens**: SHA-256 hashed verification tokens for role selection
- **CORS**: Configurable CORS settings for production environments
- **Input Validation**: All inputs validated using class-validator decorators

## Environment Variables Reference

| Variable                           | Description                            | Default                          | Required |
| ---------------------------------- | -------------------------------------- | -------------------------------- | -------- |
| `PORT`                             | Server port                            | `3000`                           | No       |
| `NODE_ENV`                         | Environment                            | `development`                    | No       |
| `POSTGRES_URL`                     | PostgreSQL connection string           | -                                | Yes      |
| `POSTGRES_MAX_OPEN_CONN`           | Maximum open connections               | `25`                             | No       |
| `POSTGRES_MIN_IDLE_CONN`           | Minimum idle connections               | `15`                             | No       |
| `POSTGRES_MAX_IDLE_TIME_SECOND`    | Max idle time (seconds)                | `900`                            | No       |
| `POSTGRES_MAX_CONN_TIMEOUT_SECOND` | Connection timeout (seconds)           | `3`                              | No       |
| `REDIS_HOST`                       | Redis host                             | `localhost`                      | Yes      |
| `REDIS_PORT`                       | Redis port                             | `6379`                           | No       |
| `JWT_SECRET`                       | JWT secret key                         | -                                | Yes      |
| `JWT_TOKEN_AUDIENCE`               | JWT audience                           | -                                | Yes      |
| `JWT_TOKEN_ISSUER`                 | JWT issuer                             | -                                | Yes      |
| `JWT_ACCESS_TOKEN_TTL`             | Access token TTL (seconds)             | `3600`                           | No       |
| `JWT_REFRESH_TOKEN_TTL`            | Refresh token TTL (seconds)            | `86400`                          | No       |
| `CORS_ORIGIN`                      | Allowed CORS origins (comma-separated) | `""`                             | No       |
| `CORS_METHODS`                     | Allowed HTTP methods                   | `GET,HEAD,PUT,PATCH,POST,DELETE` | No       |
| `CORS_CREDENTIALS`                 | Allow credentials                      | `true`                           | No       |

## Troubleshooting

### Common Issues

**Database Connection Error**

```
Error: Can't reach database server
```

- Ensure PostgreSQL is running
- Check connection string in `.env`
- Verify database user permissions

**Redis Connection Error**

```
Error: Redis connection refused
```

- Ensure Redis is running on the configured port
- Check Redis host and port in `.env`

**JWT Token Invalid**

```
401 Unauthorized: Invalid or missing access token
```

- Token may have expired, use refresh token endpoint
- Verify JWT secret matches in `.env`

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Authentication using [JWT](https://jwt.io/)
- API documentation with [Swagger](https://swagger.io/)
