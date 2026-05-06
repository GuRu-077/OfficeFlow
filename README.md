# OfficeFlow

A full-stack office scheduling and resource management system.

## Architecture

```
OfficeFlow/
├── server.js              ← Standalone Express.js backend (port 4000)
├── src/
│   ├── app/               ← Next.js frontend pages
│   ├── repositories/      ← Database access layer (Prisma + SQLite)
│   ├── services/          ← Business logic
│   ├── validations/       ← Zod input validation
│   ├── utils/             ← Helpers (auth, errors, response)
│   └── lib/
│       ├── prisma.js      ← Prisma client singleton
│       └── db.js          ← Frontend API client wrapper
├── prisma/
│   ├── schema.prisma      ← Database schema
│   ├── dev.db             ← SQLite database file
│   └── seed.js            ← Seed initial data
└── .env                   ← Environment variables
```

## How to Start

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend API
```bash
npm run backend
```
> API will be available at: **http://localhost:4000**

### Terminal 2 — Start the Frontend
```bash
npm run dev
```
> Frontend will be available at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/health`                   | Health check             |
| POST   | `/api/auth/login`               | Login (sets cookie)      |
| POST   | `/api/auth/logout`              | Logout                   |
| GET    | `/api/users`                    | List all users           |
| GET    | `/api/users/:id/notifications`  | Get user notifications   |
| GET    | `/api/rooms`                    | List all rooms           |
| POST   | `/api/rooms`                    | Create a room            |
| PUT    | `/api/rooms/:id`                | Update a room            |
| DELETE | `/api/rooms/:id`                | Delete a room            |
| GET    | `/api/resources`                | List all resources       |
| POST   | `/api/resources`                | Create a resource        |
| PUT    | `/api/resources/:id`            | Update a resource        |
| DELETE | `/api/resources/:id`            | Delete a resource        |
| GET    | `/api/meetings`                 | List all meetings        |
| POST   | `/api/meetings`                 | Book a meeting           |
| PUT    | `/api/meetings/:id`             | Update a meeting         |
| DELETE | `/api/meetings/:id`             | Cancel a meeting         |

## Database

Powered by **Prisma ORM** + **SQLite** (`prisma/dev.db`).

```bash
# Reset & re-seed the database
npm run db:seed

# View schema
cat prisma/schema.prisma

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

## Demo Accounts

| Email                       | Role     |
|-----------------------------|----------|
| admin@officeflow.com        | Admin    |
| manager@officeflow.com      | Manager  |
| employee@officeflow.com     | Employee |
