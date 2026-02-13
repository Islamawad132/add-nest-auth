# nest-authme

> Add production-ready authentication to any NestJS project in 60 seconds

[![npm version](https://badge.fury.io/js/nest-authme.svg)](https://www.npmjs.com/package/nest-authme)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/nest-authme.svg)](https://nodejs.org)

Stop writing the same authentication code for every NestJS project. Generate a complete, production-ready auth module with one command.

---

## Features

- **JWT Authentication** - Passport.js with access + refresh token rotation
- **Prisma & TypeORM** - Auto-detects your ORM and generates matching code
- **RBAC** - Role-based access control with `@Roles()` decorator
- **Change Password** - Secure password change with current password verification
- **Forgot / Reset Password** - Token-based password reset flow
- **Email Verification** - Token-based email verification flow
- **Username Support** - Optional username field on user entity
- **Rate Limiting** - `@nestjs/throttler` on auth endpoints, `@SkipThrottle()` on protected routes
- **Swagger / OpenAPI** - Full API documentation with `@nestjs/swagger` decorators
- **Unit Tests** - Generated Jest tests for AuthService and AuthController
- **Custom Decorators** - `@Public()`, `@CurrentUser()`, `@Roles()`
- **Security Best Practices** - bcrypt, class-validator, secure defaults, crypto-random secrets
- **Web GUI Mode** - Optional browser-based visual interface with live preview and real-time progress
- **`--yes` Flag** - Skip prompts with sensible defaults

---

## Quick Start

```bash
cd my-nestjs-app
npx nest-authme
```

You'll be asked to choose your interface:

```
? Choose your interface:
❯ CLI  — Terminal-based prompts
  GUI  — Web-based visual interface
```

Or launch a specific mode directly:

```bash
npx nest-authme --yes   # CLI with sensible defaults
npx nest-authme --gui   # Open web GUI in browser
```

### CLI Mode

```
🔐 NestJS Authentication Module Generator v1.3.2

✓ Detected NestJS 11.0.1
✓ Found TypeORM
✓ Source directory: src/

? Choose authentication strategy: JWT Authentication
? Enable RBAC? Yes
? Select roles: Admin, User
? Enable refresh tokens? Yes
? JWT Access Token expiration: 1 hour
? Refresh Token expiration: 7 days
? Enable rate limiting? Yes
? Enable Swagger API documentation? Yes
? Generate unit tests? Yes
? Add username field? No
? Enable email verification? No
? Enable forgot/reset password? Yes
? Auto-install dependencies? Yes

🎉 Success! Authentication module generated.
```

Then start your app:

```bash
npm run start:dev
```

---

## GUI Mode

Launch a visual web interface instead of terminal prompts:

```bash
npx nest-authme --gui
```

A local server starts and opens your browser automatically. The GUI provides:

1. **Project Detection** — Shows your NestJS version, ORM, and source root
2. **Visual Configuration** — Toggle switches, dropdowns, and checkboxes for all options
3. **File Preview** — Browse generated files with syntax highlighting before writing
4. **Real-Time Progress** — Watch each generation step complete live
5. **Success Summary** — API endpoints table, next steps, and generated file count

The server runs on `localhost` only (no external access) and auto-shuts down after generation completes.

```bash
# Custom port
npx nest-authme --gui --port 4000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and get tokens |
| `POST` | `/auth/change-password` | JWT | Change password |
| `POST` | `/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/auth/reset-password` | Public | Reset password with token |
| `GET` | `/auth/verify-email?token=...` | Public | Verify email address |
| `POST` | `/auth/resend-verification` | Public | Resend verification token |
| `POST` | `/auth/refresh` | Public | Refresh access token |
| `POST` | `/auth/logout` | JWT | Invalidate refresh token |
| `POST` | `/auth/logout-all` | JWT | Invalidate all refresh tokens |
| `GET` | `/users/profile` | JWT | Get current user profile |
| `GET` | `/users` | JWT + Admin | List all users |

> Endpoints are conditionally generated based on your selected features.

---

## What Gets Generated

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.service.spec.ts          # (if unit tests enabled)
│   ├── auth.controller.ts
│   ├── auth.controller.spec.ts       # (if unit tests enabled)
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts           # (if RBAC enabled)
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts       # (if RBAC enabled)
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── change-password.dto.ts
│   │   ├── forgot-password.dto.ts    # (if reset password enabled)
│   │   ├── reset-password.dto.ts     # (if reset password enabled)
│   │   ├── auth-response.dto.ts
│   │   └── create-user.dto.ts
│   ├── enums/
│   │   └── role.enum.ts             # (if RBAC enabled)
│   └── README.md
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── entities/
│       ├── user.entity.ts           # (TypeORM)
│       └── refresh-token.entity.ts  # (TypeORM + refresh tokens)
├── prisma/                           # (Prisma only)
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── app.module.ts                     # Updated automatically

.env                                  # Auto-generated with secure secret
.env.example                          # Git-safe reference
prisma-schema-additions.prisma        # (Prisma only) Models to add
main.ts.example                       # Swagger + ValidationPipe setup
```

---

## Configuration Options

| Prompt | Options | Default |
|--------|---------|---------|
| Authentication Strategy | JWT | JWT |
| Enable RBAC | Yes / No | Yes |
| Default Roles | Admin, User, Moderator, Guest | Admin, User |
| Refresh Tokens | Yes / No | Yes |
| Access Token TTL | 15m, 30m, 1h, 4h, 1d | 1h |
| Refresh Token TTL | 7d, 30d, 90d, 1y | 7d |
| Rate Limiting | Yes / No | Yes |
| Swagger Documentation | Yes / No | Yes |
| Unit Tests | Yes / No | Yes |
| Username Field | Yes / No | No |
| Email Verification | Yes / No | No |
| Forgot/Reset Password | Yes / No | Yes |
| Database | PostgreSQL, MySQL, SQLite, MongoDB | Auto-detect |
| Auto-install | Yes / No | Yes |

---

## ORM Support

### TypeORM (auto-detected)

Generates full entity files with decorators. Works with PostgreSQL, MySQL, and SQLite.

### Prisma (auto-detected)

Generates a `PrismaService`, `PrismaModule`, and a `prisma-schema-additions.prisma` file containing the models to copy into your `schema.prisma`:

```bash
# After generation:
# 1. Copy models from prisma-schema-additions.prisma into prisma/schema.prisma
# 2. Run migrations:
npx prisma migrate dev --name add-auth-models
npx prisma generate
```

---

## Usage Examples

### Protect Routes (default behavior)

All routes require JWT authentication by default:

```typescript
@Controller('posts')
export class PostsController {
  @Get() // Requires JWT token
  findAll() {
    return this.postsService.findAll();
  }
}
```

### Make Routes Public

```typescript
import { Public } from './auth/decorators/public.decorator';

@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

### Access Current User

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Get('me')
getProfile(@CurrentUser() user: any) {
  return { id: user.id, email: user.email };
}
```

### Restrict by Role

```typescript
import { Roles } from './auth/decorators/roles.decorator';

@Roles('Admin')
@Delete(':id')
deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

---

## Security

- Passwords hashed with **bcrypt** (configurable salt rounds via `BCRYPT_ROUNDS`)
- JWT signed with **HS256** and crypto-random secret
- Short-lived access tokens (default 1h)
- One-time use refresh tokens with database storage and rotation
- Input validation with **class-validator** on all DTOs
- Rate limiting on auth endpoints (3-5 req/min)
- Password reset tokens expire after 1 hour
- Forgot-password endpoint returns generic message to prevent email enumeration

---

## Troubleshooting

### "Not a valid NestJS project"
Make sure you're in a NestJS project directory with `@nestjs/core` in `package.json`.

### "auth/ directory already exists"
Delete the existing `src/auth/` directory before running the generator.

### "JWT secret not found"
The `.env` file is auto-generated. If missing, copy `.env.example` to `.env`.

### "Database connection failed"
Check your database credentials in `.env` and ensure the database server is running.

---

## Roadmap

- OAuth 2.0 (Google, GitHub)
- Session-based authentication
- Two-factor authentication (TOTP)
- Account lockout

---

## Requirements

- **Node.js** >= 18.0.0
- **NestJS** >= 10.0.0
- **TypeScript** >= 5.0.0
- **Package Manager**: npm, yarn, or pnpm

---

## License

MIT

---

## Links

- **npm**: https://www.npmjs.com/package/nest-authme
- **GitHub**: https://github.com/Islamawad132/add-nest-auth
- **Issues**: https://github.com/Islamawad132/add-nest-auth/issues

---

**Built for the NestJS community**
