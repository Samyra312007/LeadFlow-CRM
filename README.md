# LeadFlow CRM

Full-stack CRM application built with Next.js 16 (App Router), Express 5, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind v4, TypeScript |
| State | TanStack React Query v5, React Hook Form + Zod |
| Charts | Recharts |
| Backend | Express 5, Mongoose 9, Joi |
| Database | MongoDB (Atlas or local) |
| Testing | Jest, supertest, mongodb-memory-server |

## Prerequisites

- Node.js >= 20 LTS
- npm >= 10
- MongoDB Atlas account (free tier) or local MongoDB instance

## Quick Start

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your MongoDB connection string

# 3. Start backend
cd backend && npm run dev

# 4. Seed data (optional)
cd backend && npm run seed

# 5. Start frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
LeadFlow CRM/
├── backend/                          # Express.js REST API
│   ├── server.js                     # Entry point with graceful MongoDB fallback
│   ├── src/
│   │   ├── app.js                    # Express middleware stack
│   │   ├── config/db.js              # Mongoose connection with retry logic
│   │   ├── controllers/              # Route handlers
│   │   │   └── lead.controller.js    # CRUD + search + stats (8 endpoints)
│   │   ├── middleware/
│   │   │   ├── validate.js           # Joi validation middleware
│   │   │   └── errorHandler.js       # Global error handler
│   │   ├── models/
│   │   │   └── Lead.model.js         # Mongoose schema + getStats()
│   │   ├── routes/
│   │   │   └── lead.routes.js        # Route definitions
│   │   ├── scripts/
│   │   │   └── seed.js               # Seed 10 sample leads
│   │   └── validators/
│   │       └── lead.validator.js     # Joi schemas
│   └── tests/
│       ├── unit/                     # Model + middleware tests
│       └── integration/              # API endpoint tests
│
├── frontend/                         # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Dashboard (stats + table + chart)
│   │   │   ├── layout.tsx            # Root layout with fonts
│   │   │   └── globals.css           # Design tokens + utilities
│   │   ├── components/
│   │   │   ├── layout/               # AppShell, Sidebar, Navbar
│   │   │   ├── leads/                # StatsCards, StatusChart, LeadsTable,
│   │   │   │                         # LeadsToolbar, Pagination, LeadForm,
│   │   │   │                         # LeadModal, StatusBadge
│   │   │   └── ui/                   # Button, Card, Input, Select, Textarea,
│   │   │                             # Badge, Dialog/ConfirmDialog
│   │   ├── hooks/
│   │   │   └── useLeads.ts           # React Query hooks (6)
│   │   ├── constants/
│   │   │   └── leadStatus.ts         # Types + status constants
│   │   └── lib/
│   │       └── api.ts                # Axios client
│   └── public/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/leads` | List leads (pagination, search, filter, sort) |
| GET | `/api/v1/leads/stats` | Lead statistics by status |
| GET | `/api/v1/leads/search?q=` | Full-text search |
| GET | `/api/v1/leads/:id` | Get lead by ID |
| POST | `/api/v1/leads` | Create lead |
| PUT | `/api/v1/leads/:id` | Update lead |
| PATCH | `/api/v1/leads/:id/status` | Update lead status |
| DELETE | `/api/v1/leads/:id` | Delete lead |

## Testing

```bash
# Backend tests (64 tests: 18 model + 7 middleware + 39 API)
cd backend && npm test

# Backend tests in watch mode
cd backend && npm run test:watch

# Frontend build check
cd frontend && npm run build
```

## Design System

Nexus CRM palette with 48 custom colors defined in `frontend/src/app/globals.css` via Tailwind v4 `@theme` directive. Typography uses Plus Jakarta Sans (headings) and Inter (body).

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | — | MongoDB connection string |
| `NODE_ENV` | `development` | Environment mode |
| `ALLOWED_ORIGINS` | `*` | CORS origins (comma-separated) |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api/v1` | Backend API URL |
