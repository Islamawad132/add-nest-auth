# add-nest-auth

> Add production-ready authentication to any NestJS project in 60 seconds ⚡

[![npm version](https://badge.fury.io/js/add-nest-auth.svg)](https://www.npmjs.com/package/add-nest-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/add-nest-auth.svg)](https://nodejs.org)

Stop writing the same authentication code for every NestJS project. Generate a complete, production-ready auth module with one command.

---

## ✨ Features

- 🚀 **60-second setup** - Complete auth module with one command
- 🔐 **JWT Authentication** - Passport.js + access/refresh tokens
- 👥 **RBAC Support** - Role-based access control (optional)
- 🔄 **Token Rotation** - Secure refresh token implementation
- 🎨 **Custom Decorators** - `@Public()`, `@CurrentUser()`, `@Roles()`
- 💾 **TypeORM Integration** - Auto-detect and generate entities
- 🛡️ **Security Best Practices** - bcrypt, class-validator, secure defaults
- 📦 **Zero Config** - Beautiful interactive CLI
- 🎯 **Type Safe** - Full TypeScript support
- ✅ **Production Ready** - Battle-tested patterns

---

## 🚀 Quick Start

### 1. Run the CLI

Navigate to your NestJS project and run:

```bash
cd my-nestjs-app
npx add-nest-auth
```

### 2. Follow Interactive Prompts

```
🔐 NestJS Authentication Module Generator v1.0.0

✓ Detected NestJS 11.0.1
✓ Source directory: src/

? Choose authentication strategy: JWT Authentication
? Enable RBAC? Yes
? Select roles: Admin, User
? Enable refresh tokens? Yes
? JWT expiration: 1 hour
? Auto-install dependencies? Yes

⚙️  Generating authentication module...

✓ Generated 21 files
✓ Updated app.module.ts
✓ Updated package.json
✓ Dependencies installed

🎉 Success! Authentication module generated.
```

### 3. Configure & Start

```bash
# Copy environment variables
cp .env.example .env

# Run database migrations (TypeORM)
npm run migration:generate -- src/migrations/CreateAuthTables
npm run migration:run

# Start your app
npm run start:dev
```

### 4. Test It Out

```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Access protected route
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your-access-token>"
```

**That's it!** 🎉

---

## 📦 What Gets Generated

### File Structure (21 Files)

```
src/
├── auth/
│   ├── auth.module.ts              # Module configuration
│   ├── auth.service.ts             # Business logic
│   ├── auth.controller.ts          # REST endpoints
│   ├── strategies/
│   │   ├── jwt.strategy.ts         # JWT validation
│   │   └── local.strategy.ts       # Login validation
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # Protect routes
│   │   ├── local-auth.guard.ts     # Login guard
│   │   └── roles.guard.ts          # RBAC guard
│   ├── decorators/
│   │   ├── public.decorator.ts     # @Public()
│   │   ├── current-user.decorator.ts # @CurrentUser()
│   │   └── roles.decorator.ts      # @Roles()
│   ├── dto/
│   │   ├── login.dto.ts            # Login validation
│   │   ├── register.dto.ts         # Register validation
│   │   ├── auth-response.dto.ts    # Response shape
│   │   └── create-user.dto.ts      # User creation
│   ├── enums/
│   │   └── role.enum.ts            # Role definitions
│   └── README.md                   # Usage guide
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── entities/
│       ├── user.entity.ts          # User model
│       └── refresh-token.entity.ts # Refresh tokens
└── app.module.ts                   # ✏️ Updated

.env.example                        # Environment template
package.json                        # ✏️ Dependencies added
```

### Dependencies Added (~8 packages)

```json
{
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/typeorm": "^11.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

---

## 📖 Usage Examples

### Protect Routes (Default Behavior)

All routes require authentication by default:

```typescript
@Controller('posts')
export class PostsController {
  @Get() // ⛔ Requires JWT token
  findAll() {
    return this.postsService.findAll();
  }
}
```

### Make Routes Public

Use `@Public()` decorator:

```typescript
import { Public } from './auth/decorators/public.decorator';

@Public() // ✅ No authentication needed
@Get('public')
getPublicData() {
  return 'Everyone can see this';
}
```

### Access Current User

Use `@CurrentUser()` decorator:

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Get('me')
getProfile(@CurrentUser() user: any) {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles,
  };
}
```

### Restrict by Role (RBAC)

Use `@Roles()` decorator:

```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Delete(':id')
deleteUser(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

### Refresh Tokens

Automatically generated endpoint:

```bash
POST /auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "..." }
```

---

## 🎯 Configuration Options

### Interactive Prompts

| Prompt | Options | Default |
|--------|---------|---------|
| **Authentication Strategy** | JWT, OAuth (v1.1), Session (v1.2) | JWT |
| **Enable RBAC** | Yes, No | Yes |
| **Default Roles** | Admin, User, Moderator, Guest | Admin, User |
| **Refresh Tokens** | Yes, No | Yes |
| **Access Token TTL** | 15m, 30m, 1h, 4h, 1d | 1h |
| **Refresh Token TTL** | 7d, 30d, 90d, 1y | 7d |
| **Database** | PostgreSQL, MySQL, SQLite, MongoDB | Auto-detect |
| **Auto-install** | Yes, No | Yes |

### Command-Line Flags (Coming Soon)

```bash
npx add-nest-auth --preset jwt-rbac    # Use preset
npx add-nest-auth --dry-run            # Preview changes
npx add-nest-auth --force              # Overwrite existing
npx add-nest-auth --no-install         # Skip npm install
```

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **JWT Signing** - HS256 algorithm with secrets
- ✅ **Token Expiration** - Short-lived access tokens
- ✅ **Refresh Rotation** - One-time use refresh tokens
- ✅ **Input Validation** - class-validator on all DTOs
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Guard Protection** - Automatic route protection

---

## 📚 Documentation

- **[Complete Usage Guide](./USAGE.md)** - Comprehensive documentation
- **[Generated README](./src/auth/README.md)** - Created after generation
- **[NestJS Docs](https://docs.nestjs.com/security/authentication)** - Official docs

---

## 🛠️ Requirements

- **Node.js** >= 18.0.0
- **NestJS** >= 10.0.0
- **TypeScript** >= 5.0.0
- **Package Manager**: npm, yarn, or pnpm

---

## 🎬 Coming Soon

### v1.1 - OAuth Integration
- Google OAuth
- GitHub OAuth
- Facebook OAuth

### v1.2 - Session-Based Auth
- Express session support
- Cookie-based authentication

### v1.3 - Multi-ORM Support
- Prisma templates
- Mongoose templates

### v1.4 - Advanced Features
- Email verification
- Password reset flow
- Two-factor authentication (TOTP)
- Account lockout

### v2.0 - Admin Panel
- Auto-generated admin UI
- User management
- Role management

---

## 🐛 Troubleshooting

### "Not a valid NestJS project"
Ensure you're in a NestJS project directory with `@nestjs/core` in package.json.

### "auth/ directory already exists"
Delete existing `src/auth/` directory or use `--force` flag (coming soon).

### "JWT secret not found"
Copy `.env.example` to `.env` and set `JWT_SECRET`.

### "Database connection failed"
Check database credentials in `.env` and ensure database is running.

**[See full troubleshooting guide →](./USAGE.md#troubleshooting)**

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT © [Your Name]

---

## 🌟 Show Your Support

If this tool helped you, please consider:

- ⭐ Starring the repo
- 🐛 Reporting issues
- 💡 Suggesting features
- 📢 Sharing with others

---

## 🔗 Links

- **GitHub**: https://github.com/Islamawad132/add-nest-auth
- **npm**: https://www.npmjs.com/package/add-nest-auth
- **Issues**: https://github.com/Islamawad132/add-nest-auth/issues

---

**Built with ❤️ for the NestJS community**
