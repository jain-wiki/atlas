# Backend Project TODO - Hono + Better Auth + SQLite

## Project Overview
- **Framework**: Hono
- **Runtime**: Bun
- **Database**: Local SQLite file
- **Query Builder**: Knex
- **Authentication**: Better Auth (Google OAuth only)
- **API Root**: `/api`
- **Protected Routes**: `/api/p/`
- **Public Routes**: `/api/public/`

---

## 1. Project Initialization

### 1.1 Project info
- [x] Read `apps/backend/package.json` to understand project structure and dependencies
- [x] Read directory structure and file names in `apps/backend/` to understand where files will be created

### 1.2 Install Dependencies
- [x] Install Hono: `bun add hono`
- [x] Install Better Auth: `bun add better-auth`
- [x] Install SQLite driver: `bun add better-sqlite3`
- [x] Install Knex: `bun add knex`
- [x] Install development dependencies: `bun add -d @types/better-sqlite3`

---

## 2. Environment Configuration

- [x] Read `apps/backend/.env` file to understand environment variables

---

## 3. Database Setup

### 3.1 Knex Configuration
- DB File name `db.sqlite`

### 3.2 Database Connection
- [x] Create `lib/db.ts`:
  - Initialize Knex with configuration, using `client: 'better-sqlite3'`,
  - Export database connection instance

### 3.3 Create Migration Files
- [x] Run `bunx knex migrate:make create_places_table`
- [x] Run `bunx knex migrate:make create_places_log_table`

### 3.4 Define Places Table Migration
- [x] Create migration for `places` table with fields:
  - `id` - VARCHAR(10) PRIMARY KEY (alphanumeric)
  - `name` - VARCHAR(100) NOT NULL
  - `additional_names` - VARCHAR(500)
  - `type_of_place` - CHAR(1)
  - `description` - VARCHAR(1000) (markdown content)
  - `created_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3.5 Define Places Log Table Migration
- [x] Create migration for `places_log` table:
  - `id` - INTEGER PRIMARY KEY AUTOINCREMENT
  - `place_id` - VARCHAR(10) REFERENCES places(id)
  - `action` - CHAR(1) // (I, U, D)
  - `old_data` - TEXT (JSON)
  - `new_data` - TEXT (JSON)
  - `user_email` - VARCHAR(255) (from Better Auth)
  - `created_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3.6 Run Migrations
- [x] Execute `bunx knex migrate:latest`

---

## 4. Better Auth Setup

### 4.1 Better Auth Configuration
- [x] Create `lib/auth.ts`:
  - Configure Better Auth with SQLite adapter
  - Set up Google OAuth provider only
  - Configure session management
  - Set up required tables (users, sessions, accounts, etc.)

### 4.2 Auth Middleware
- [x] Create `/routes/middleware/auth.ts`:
  - Create middleware to protect routes with 'p' prefix
  - Extract user information from session
  - Handle authentication errors

---

## 5. Hono Server Setup

### 5.1 Main Server File
- [x] Create `/index.ts`:
  - Initialize Hono app
  - Mount Better Auth routes
  - Set up API routing with `/api` prefix
  - Configure error handling middleware

### 5.2 Route Structure
- [x] Create `/routes/auth.ts` - Authentication routes
- [x] Create `/routes/placeview.ts` - Places Create,Update,Delete routes
- [x] Create `/routes/placeupdate.ts` - Places List and View routes
- [x] Create route mounting in file `routes/route.ts` and import all routes

---

## 6. API Routes Implementation

### 6.1 Places Log Service
- [x] Create `/helper/placelog.ts`:
  - `logPlaceAction(placeId, action, oldData, newData, userEmail)`
  - Integration with all CRUD operations, coming in next sections

### 6.4 Places Routes Implementation

#### 6.4.1 GET /api/place/list - List Places
- [ ] Implement route with query parameters:
  - `name` - filter by name or additional names including partial match
  - `type` - filter by type of place
  - `id` - filter by place ID starting with the given string
  - `limit` - pagination limit
  - `offset` - pagination offset

#### 6.4.2 GET /api/place/:id - View One Place
- [ ] Implement route to get single place by ID
- [ ] Handle 404 for non-existent place

#### 6.4.3 POST /api/p/place - Add Place (Protected)
- [ ] Implement creation route
- [ ] Generate unique 10-character ID using nanoid
- [ ] Validate required fields using Zod and Hono validation
- [ ] Log creation in place_log table

#### 6.4.4 PUT /api/p/place/:id - Edit Place (Protected)
- [ ] Implement update route
- [ ] Validate input data using Zod and Hono validation
- [ ] Check place exists before updating
- [ ] Log changes in place_log table

#### 6.4.5 DELETE /api/p/place/:id - Delete Place (Protected)
- [ ] Implement deletion route
- [ ] Check place exists before deleting
- [ ] Log deletion in places_log table



---

## 8. Error Handling & Validation

### 8.1 Error Middleware
- [ ] Create `/middleware/errorhandler.ts`:
  - Global error handling
  - Standardized error responses
  - Logging of errors

### 8.2 Response Helpers
- [ ] Create `/middleware/responses.ts`:
  - Standardized success/error response formats

---

## 11. Security & Production Considerations

### 11.1 Security Headers
- [ ] Add security middleware to Hono app

---

## 12. Final Steps

### 12.1 Package.json Scripts
- [ ] Add migration script: `"migrate": "bunx knex migrate:latest"`
- [ ] Add rollback script: `"rollback": "bunx knex migrate:rollback"`

---

## Additional Notes

- All protected routes must verify user authentication via Better Auth
- API responses should follow consistent JSON structure
- Consider adding input sanitization for markdown content in description field
