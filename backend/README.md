# LeadFlow CRM — Backend API

Express.js REST API for managing sales leads.

## Quick Start

### Prerequisites
- Node.js 20+ 
- MongoDB Atlas account (free tier) or local MongoDB

### 1. Setup MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in
2. Create a new project (e.g., "LeadFlow CRM")
3. Build a **free M0 cluster** (shared, no-cost)
4. Under **Security > Network Access**, add `0.0.0.0/0` (allow all — for dev)
5. Under **Security > Database Access**, create a database user
6. Click **Connect** → **Drivers** → copy the connection string

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
# Edit .env and paste your MongoDB connection string
# Replace <username>, <password>, and cluster details
```

**Required `.env` variables:**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leadflow
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Install & Run

```bash
npm install
npm run dev      # Development with nodemon
# or
npm start        # Production
```

The server starts at `http://localhost:5000`.

### 4. Seed Sample Data

```bash
npm run seed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/leads` | List leads (paginated) |
| GET | `/api/v1/leads/stats` | Dashboard stats |
| GET | `/api/v1/leads/search` | Search leads |
| GET | `/api/v1/leads/:id` | Get single lead |
| POST | `/api/v1/leads` | Create lead |
| PUT | `/api/v1/leads/:id` | Update lead |
| PATCH | `/api/v1/leads/:id/status` | Update status only |
| DELETE | `/api/v1/leads/:id` | Delete lead |

### Query Parameters (GET /leads)

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Results per page (max 100) |
| `status` | - | Filter by status |
| `search` | - | Search name, email, company |
| `sortBy` | createdAt | Sort field |
| `order` | desc | asc or desc |

## Project Structure

```
backend/
├── server.js              # Entry point
├── src/
│   ├── app.js             # Express app (middleware, routes)
│   ├── config/
│   │   └── db.js          # MongoDB connection with retry
│   ├── controllers/
│   │   └── lead.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   └── Lead.model.js  # Mongoose schema + indexes
│   ├── routes/
│   │   └── lead.routes.js
│   ├── scripts/
│   │   └── seed.js        # Sample data seeder
│   └── validators/
│       └── lead.validator.js  # Joi schemas
├── .env.example
└── package.json
```
