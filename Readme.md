# COMP 3123 – Assignment 1: Employee Management REST API

**Student:** Zuheb Mohamud — **Student ID:** 101555019

## 1. Project

**Purpose:** A secure REST API where users sign up, log in (JWT), and manage **only their own** employees (create, view, update, delete).

**Technologies:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `express-rate-limit`, `winston`, `dotenv`, `nodemon`, Postman.

**Project structure:**
```
src/
  server.js        # starts the app and connects to MongoDB
  app.js           # Express app, middleware and routes
  config/          # env variables, database connection
  models/          # User, Employee
  controllers/     # user, employee, health
  routes/          # /api/v1/user, /api/v1/emp, /health
  middleware/      # auth (JWT), validation, rate limiting, logging, error handler
  services/        # JWT service, employee ownership logic
  validators/      # input validation rules
  utils/           # logger, error class
logs/              # log files (sample.log committed)
postman_collection/# Postman collection
screenshots/       # test evidence
```

## 2. Installation

1. **Clone:** `git clone https://github.com/zuheb123-lgtm/101555019_COMP3123_Assignment1.git`
2. **Install dependencies:** `npm install`
3. **Configure environment variables:** copy `.env.example` to `.env` and fill in the values (see Configuration).
4. **Start MongoDB:** this project uses **MongoDB Atlas** — create a free cluster, add a database user, allow your IP in Network Access, and paste the connection string into `MONGODB_URI`. The database name is **`comp3123_assignment1`**.
5. **Start the app:** `npm run dev` (or `npm start`). You should see `MongoDB connected` and `Server started on port 3000`.
6. **Test the API:** import the `postman_collection/` folder into Postman. Run the signup and login requests first — login saves the token into `{{tokenA}}` / `{{tokenB}}` automatically.

## 3. Configuration

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development` |
| `MONGODB_URI` | MongoDB connection string (ends with `/comp3123_assignment1`) |
| `JWT_SECRET` | Long random secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |

The real `.env` is git-ignored. Only `.env.example` (no real values) is committed.

## 4. API Endpoints

| Method | Endpoint | Auth | Success | Purpose |
|---|---|---|---|---|
| POST | `/api/v1/user/signup` | No | 201 | Register a user |
| POST | `/api/v1/user/login` | No | 200 | Log in with username **or** email + password, returns JWT |
| GET | `/api/v1/emp/employees` | JWT | 200 | Get my employees |
| POST | `/api/v1/emp/employees` | JWT | 201 | Create an employee |
| GET | `/api/v1/emp/employees/{eid}` | JWT | 200 | Get one of my employees |
| PUT | `/api/v1/emp/employees/{eid}` | JWT | 200 | Update one of my employees |
| DELETE | `/api/v1/emp/employees?eid=xxx` | JWT | 204 | Delete one of my employees |
| GET | `/health` | No | 200 | Health check |

## 5. Authentication

- **Signup:** validates input, rejects duplicate username/email (409), hashes the password with bcrypt, saves the user. The password is never returned.
- **Login:** accepts `username` or `email` + `password`. Compares with the stored hash. Valid → returns a **JWT**; invalid → `401`.
- **JWT:** signed with `JWT_SECRET`, contains the user ID, expires after 1 hour.
- **Authorization header:** `Authorization: Bearer <jwt>`
- **Protected employee endpoints:** every `/api/v1/emp` route goes through the auth middleware, which returns **401** for a missing, invalid or expired token.

## 6. Authorization

- Each employee has a `user` field (ObjectId → User). One user owns many employees.
- The owner is always taken from the **verified JWT**, never from the request body or URL.
- Every query filters by **both** the employee ID and the owner, e.g. `Employee.findOne({ _id: eid, user: req.user.id })`.
- Another user's employee → **403 Forbidden**. Employee that doesn't exist → **404**.
- **Tested with two users:** User A only sees Alice, User B only sees Bob. B trying to GET/PUT/DELETE A's employee → 403, and A trying to GET B's → 403.

## 7. Security

- **Password hashing:** bcrypt (10 salt rounds) before saving. Passwords are never stored in plain text or returned in responses.
- **JWT:** stateless login tokens with a 1-hour expiry.
- **Helmet:** adds security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`) and hides `X-Powered-By`, protecting against clickjacking, MIME sniffing and info leaks.
- **Input validation:** `express-validator` checks required fields, lengths, email format, positive numeric salary, valid dates, valid MongoDB ObjectIds, and rejects unknown fields and malformed JSON (400).
- **Environment variables:** secrets are only in `.env`, never in the code or on GitHub.

### Rate Limiting
- **What it is:** limits how many requests one IP can send in a time period, to stop brute-force login attempts and spam signups.
- **Protected endpoints:** `POST /api/v1/user/login` (10 per 15 min), `POST /api/v1/user/signup` (10 per 15 min), and all `/api/*` routes (200 per 15 min).
- **When exceeded:** returns **429 Too Many Requests** with `"Too many login attempts. Please try again after 15 minutes."` and is logged as `Rate limit exceeded`.
- **Test result:** 10 failed logins returned 401, the 11th returned **429** (see screenshots).

### HTTP Status Codes
| Code | Used for |
|---|---|
| 200 / 201 / 204 | Success / created / deleted |
| 400 | Validation error, invalid ID, malformed JSON |
| 401 | Missing, invalid or expired token; wrong login |
| 403 | Employee belongs to another user |
| 404 | Employee or route not found |
| 409 | Username or email already exists |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

All errors are handled by one centralized error handler and returned as JSON: `{ "success": false, "status": 400, "message": "...", "errors": [...] }`.

## 8. Logging

- **Where:** `logs/app.log` (all logs) and `logs/error.log` (errors only), written with winston. These are git-ignored, so `logs/sample.log` is committed as an example.
- **What is logged:** timestamp, method, path, status, duration, IP and user ID for every request; server start; login success/failure; missing/invalid/expired tokens; validation failures; cross-user access blocked; rate limit exceeded; employee created/updated/deleted; server errors.
- **Excluded on purpose:** passwords, password hashes, JWT tokens, the Authorization header, the JWT secret, database credentials and request bodies. Validation logs only include field names, not values.

## 9. Health Check

**URL:** `GET http://localhost:3000/health`

**Response (200):**
```json
{
  "status": "ok",
  "service": "COMP3123 Assignment 1 - Employee Management API",
  "uptime_seconds": 110,
  "timestamp": "2026-10-16T23:39:40.315Z",
  "database": { "status": "connected", "name": "comp3123_assignment1" }
}
```
Returns 503 if the database is disconnected.

## 10. Sample Credentials (test only)

| User | Username | Email | Password |
|---|---|---|---|
| A | `usera` | `usera@test.com` | `Password123` |
| B | `userb` | `userb@test.com` | `Password123` |
