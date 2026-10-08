# Papandayan Cargo – Auth App

Stack: React (Vite) · Node.js/Express · PostgreSQL · Prisma · JWT (access + refresh token rotation)

## 1. Prerequisites (Windows)
- Node.js 20 LTS (https://nodejs.org)
- PostgreSQL 15/16 (https://www.postgresql.org/download/windows/) – remember the `postgres` password you set
- Create a database named `papandayan` (pgAdmin, or: `psql -U postgres -c "CREATE DATABASE papandayan;"`)

## 2. Backend
```bash
cd backend
npm install
copy .env.example .env      # then edit DATABASE_URL password + the two JWT secrets
npx prisma migrate dev --name init
npm run dev                 # http://localhost:4000
```

## 3. Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev                 # http://localhost:5173
```

## 4. Tests (backend)
```bash
cd backend
npm test
```
Tests run against the database in `.env`; they only create/delete users with emails ending in `@test.local`.

## API
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | email, username, password |
| POST | /api/auth/login | – | identifier (email or username), password → access + refresh token |
| POST | /api/auth/refresh | – | refreshToken → new token pair (old one invalidated) |
| POST | /api/auth/logout | – | refreshToken → revoked |
| GET | /api/users | Bearer | user list (JWT guard) |
