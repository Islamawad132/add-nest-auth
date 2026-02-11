# Usage Guide - add-nest-auth

Complete guide to using `add-nest-auth` CLI tool for generating NestJS authentication modules.

---

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Interactive Prompts](#interactive-prompts)
4. [Command-Line Options](#command-line-options)
5. [What Gets Generated](#what-gets-generated)
6. [Post-Generation Steps](#post-generation-steps)
7. [Configuration Options](#configuration-options)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## Installation

### Option 1: Direct Execution (Recommended)

No installation needed! Use `npx` to run directly:

```bash
npx add-nest-auth
```

### Option 2: Global Installation

Install globally to use anywhere:

```bash
npm install -g add-nest-auth
add-nest-auth
```

### Option 3: Local Dev Dependency

Add to your project's dev dependencies:

```bash
npm install --save-dev add-nest-auth
npx add-nest-auth
```

---

## Basic Usage

### Prerequisites

- **Node.js** >= 18.0.0
- **Existing NestJS project** (v10+)
- **Package manager**: npm, yarn, or pnpm

### Quick Start

1. Navigate to your NestJS project:
   ```bash
   cd my-nestjs-app
   ```

2. Run the CLI:
   ```bash
   npx add-nest-auth
   ```

3. Follow the interactive prompts

4. Install dependencies (if not auto-installed):
   ```bash
   npm install
   ```

5. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

6. Start your app:
   ```bash
   npm run start:dev
   ```

---

## Interactive Prompts

When you run the CLI, you'll be asked a series of questions:

### 1. Authentication Strategy

```
? Choose authentication strategy:
❯ JWT Authentication (Recommended)
  OAuth 2.0 (Google, GitHub) [v1.1]
  Session-based (Traditional) [v1.2]
```

**What to choose:**
- **JWT** - For modern APIs, SPAs, mobile apps (Recommended)
- **OAuth** - For social login (Coming in v1.1)
- **Session** - For traditional server-rendered apps (Coming in v1.2)

---

### 2. Role-Based Access Control (RBAC)

```
? Enable Role-Based Access Control (RBAC)? (Y/n)
```

**What it does:**
- Adds `@Roles()` decorator
- Adds `RolesGuard`
- Adds `roles` field to User entity
- Enables route protection by user roles

**Choose Yes if:** You need different permission levels (Admin, User, Moderator, etc.)

**Choose No if:** All authenticated users have the same permissions

---

### 3. Select Roles (if RBAC enabled)

```
? Select default roles: (Press <space> to select, <enter> to continue)
◉ Admin
◉ User
◯ Moderator
◯ Guest
```

**What it does:**
- Creates a `Role` enum with selected roles
- Default user role will be "User"
- You can add custom roles later

---

### 4. Enable Refresh Tokens

```
? Enable Refresh Token rotation? (Y/n)
```

**What it does:**
- Adds refresh token storage (database table)
- Adds `POST /auth/refresh` endpoint
- Implements token rotation for security

**Choose Yes if:** You want more secure, long-lived authentication

**Choose No if:** Simple access tokens are sufficient

---

### 5. JWT Configuration

```
? JWT Access Token expiration:
  15 minutes
  30 minutes
❯ 1 hour (Recommended)
  4 hours
  1 day
```

**Access Token:**
- Short-lived token for API requests
- Recommended: 15m - 1h for high security
- Use longer (1h - 4h) for convenience

```
? JWT Refresh Token expiration:
❯ 7 days (Recommended)
  30 days
  90 days
  1 year
```

**Refresh Token:**
- Long-lived token for getting new access tokens
- Recommended: 7 days - 30 days
- Longer = more convenience, less security

---

### 6. Database Configuration

```
? Detected TypeORM with PostgreSQL. Use it? (Y/n)
```

**Auto-detection:**
- Detects existing ORM (TypeORM, Prisma, Mongoose)
- Detects database driver (PostgreSQL, MySQL, etc.)

**If no ORM detected:**
```
? Select database:
❯ PostgreSQL (Recommended)
  MySQL
  SQLite (for testing)
  MongoDB
```

---

### 7. Auto-install Dependencies

```
? Auto-install dependencies after generation? (Y/n)
```

**What it does:**
- Runs `npm install` (or `yarn`/`pnpm`) automatically
- Installs ~8 new packages

**Choose Yes if:** You want everything set up automatically

**Choose No if:** You want to review changes first or install manually

---

## Command-Line Options

### Basic Commands

```bash
# Show version
npx add-nest-auth --version

# Show help
npx add-nest-auth --help
```

### Advanced Options (Coming in Phase 4)

```bash
# Preview without making changes
npx add-nest-auth --dry-run

# Overwrite existing files
npx add-nest-auth --force

# Skip dependency installation
npx add-nest-auth --no-install

# Use preset configuration
npx add-nest-auth --preset jwt-rbac

# Load config from file
npx add-nest-auth --config auth-config.json
```

---

## What Gets Generated

### File Structure

Running the CLI creates approximately **21 files**:

```
src/
├── auth/
│   ├── auth.module.ts              # Auth module configuration
│   ├── auth.service.ts             # Login, register, token logic
│   ├── auth.controller.ts          # /auth endpoints
│   ├── strategies/
│   │   ├── jwt.strategy.ts         # JWT validation
│   │   └── local.strategy.ts       # Username/password validation
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # Protect routes with JWT
│   │   ├── local-auth.guard.ts     # Login endpoint guard
│   │   └── roles.guard.ts          # RBAC guard (if enabled)
│   ├── decorators/
│   │   ├── public.decorator.ts     # @Public() decorator
│   │   ├── current-user.decorator.ts # @CurrentUser() decorator
│   │   └── roles.decorator.ts      # @Roles() decorator (if RBAC)
│   ├── dto/
│   │   ├── login.dto.ts            # Login validation
│   │   ├── register.dto.ts         # Registration validation
│   │   ├── auth-response.dto.ts    # Response structure
│   │   └── create-user.dto.ts      # User creation
│   ├── enums/
│   │   └── role.enum.ts            # Role enum (if RBAC)
│   └── README.md                   # Usage documentation
│
└── users/
    ├── users.module.ts             # Users module
    ├── users.service.ts            # User CRUD operations
    ├── users.controller.ts         # /users endpoints
    └── entities/
        ├── user.entity.ts          # User database model
        └── refresh-token.entity.ts # Refresh tokens (if enabled)

.env.example                        # Environment variables template
```

### Modified Files

The CLI also modifies 2 existing files:

1. **`src/app.module.ts`** - Adds imports for `ConfigModule`, `AuthModule`, `UsersModule`
2. **`package.json`** - Adds ~8 authentication dependencies

### Dependencies Added

```json
{
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/typeorm": "^11.0.0",
  "typeorm": "^0.3.20",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "pg": "^8.11.3"
}
```

---

## Post-Generation Steps

After running the CLI, follow these steps:

### 1. Install Dependencies (if skipped)

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and update values:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=myapp
```

**Important:** Change `JWT_SECRET` to a secure random value (or keep the auto-generated one).

### 3. Set Up Database (TypeORM)

Generate migration:
```bash
npm run migration:generate -- src/migrations/CreateAuthTables
```

Run migration:
```bash
npm run migration:run
```

### 4. Start Your Application

```bash
npm run start:dev
```

### 5. Test the Endpoints

#### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["User"]
  }
}
```

#### Access Protected Route:
```bash
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your-access-token>"
```

---

## Configuration Options

### JWT Configuration

Located in `.env`:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**JWT_SECRET:**
- Must be at least 32 characters
- Use a cryptographically secure random string
- Never commit to version control

**JWT_EXPIRES_IN:**
- Format: `15m`, `1h`, `2d`, etc.
- Short-lived for security (15m - 1h recommended)

**JWT_REFRESH_EXPIRES_IN:**
- Format: `7d`, `30d`, `90d`, etc.
- Long-lived for convenience (7d - 30d recommended)

### Database Configuration

**PostgreSQL:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=myapp
```

**MySQL:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=myapp
```

**MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/myapp
```

---

## Examples

### Example 1: Basic JWT Authentication

**Configuration:**
- Strategy: JWT
- RBAC: No
- Refresh Tokens: No

**Result:** Simple JWT authentication with login/register endpoints.

**Use case:** Small apps, MVPs, prototypes

---

### Example 2: JWT with RBAC

**Configuration:**
- Strategy: JWT
- RBAC: Yes (Admin, User roles)
- Refresh Tokens: Yes

**Result:** Full-featured authentication with role-based permissions.

**Use case:** Production applications with different user types

**Using RBAC:**
```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Get('admin-only')
adminRoute() {
  return 'Only admins can see this';
}
```

---

### Example 3: Public Routes

Make routes public (no authentication):

```typescript
import { Public } from './auth/decorators/public.decorator';

@Public()
@Get('public')
publicRoute() {
  return 'Everyone can see this';
}
```

---

### Example 4: Get Current User

Access authenticated user:

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Get('me')
getProfile(@CurrentUser() user: any) {
  return user;
}
```

---

### Example 5: Refresh Token Flow

1. Login and get tokens:
```bash
POST /auth/login
Response: { accessToken, refreshToken, user }
```

2. Use access token for requests:
```bash
GET /users/profile
Header: Authorization: Bearer <accessToken>
```

3. When access token expires, refresh it:
```bash
POST /auth/refresh
Body: { refreshToken: "<refreshToken>" }
Response: { accessToken }
```

---

## Troubleshooting

### Error: "Not a valid NestJS project"

**Cause:** CLI couldn't find `@nestjs/core` in `package.json`

**Solution:**
1. Ensure you're in a NestJS project directory
2. Run `npm install` to ensure dependencies are installed
3. Check `package.json` has `@nestjs/core` dependency

---

### Error: "auth/ directory already exists"

**Cause:** An `src/auth/` directory already exists

**Solution:**
1. Delete or rename existing `src/auth/` directory
2. Use `--force` flag to overwrite (coming in Phase 4)

---

### Error: "JWT secret not found"

**Cause:** Missing `JWT_SECRET` in `.env` file

**Solution:**
1. Copy `.env.example` to `.env`
2. Ensure `JWT_SECRET` is set
3. Restart your application

---

### Error: "Database connection failed"

**Cause:** Invalid database credentials or database not running

**Solution:**
1. Check database is running (`docker ps` or service status)
2. Verify credentials in `.env` file
3. Test connection manually

---

### Error: "Entity not found"

**Cause:** Database tables not created (TypeORM)

**Solution:**
```bash
npm run migration:generate -- src/migrations/CreateAuthTables
npm run migration:run
```

---

### Error: "Invalid credentials" on login

**Possible causes:**
1. Wrong email or password
2. User doesn't exist (register first)
3. Password is case-sensitive

**Solution:**
- Verify email and password are correct
- Register user first if needed
- Check password meets requirements (min 8 characters)

---

### Dependencies Installation Failed

**Cause:** Network issues or package manager error

**Solution:**
1. Run manually: `npm install`
2. Clear cache: `npm cache clean --force`
3. Try different package manager: `yarn install`

---

### TypeScript Compilation Errors

**Cause:** Missing type definitions or version mismatch

**Solution:**
1. Install missing types: `npm install --save-dev @types/passport-jwt @types/passport-local @types/bcrypt`
2. Update TypeScript: `npm install --save-dev typescript@latest`
3. Check tsconfig.json has correct settings

---

## Advanced Usage

### Custom Roles

Add custom roles after generation:

1. Edit `src/auth/enums/role.enum.ts`:
```typescript
export enum Role {
  ADMIN = 'Admin',
  USER = 'User',
  MODERATOR = 'Moderator',
  CUSTOM = 'Custom', // Add your role
}
```

2. Use in decorators:
```typescript
@Roles('Custom')
@Get('custom-route')
customRoute() {
  return 'Custom role only';
}
```

---

### Multiple JWT Strategies

For advanced use cases (admin vs user tokens), extend the generated code:

1. Create new strategy (e.g., `admin-jwt.strategy.ts`)
2. Create new guard (e.g., `admin-jwt-auth.guard.ts`)
3. Register in `auth.module.ts`

---

### Password Requirements

Customize password validation in `src/auth/dto/register.dto.ts`:

```typescript
import { Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
```

---

## Getting Help

- **Issues:** https://github.com/yourusername/add-nest-auth/issues
- **Documentation:** See generated `src/auth/README.md`
- **NestJS Docs:** https://docs.nestjs.com/security/authentication

---

## Next Steps

After successfully generating authentication:

1. ✅ Customize generated code to fit your needs
2. ✅ Add additional fields to User entity (name, avatar, etc.)
3. ✅ Implement email verification (coming in v1.5)
4. ✅ Add two-factor authentication (coming in v1.6)
5. ✅ Set up rate limiting for auth endpoints
6. ✅ Add password reset flow (coming in v1.6)
7. ✅ Deploy to production with HTTPS

---

**Happy coding! 🚀**
