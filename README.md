# HWAIDashboard

A production-ready full-stack dashboard application built with Node.js, Express, React, PostgreSQL, and Redis.

## Tech Stack

- **Backend**: Node.js + Express (port 3001)
- **Frontend**: React 18 (port 3000)
- **Charts**: Recharts
- **Database**: PostgreSQL (via pg package)
- **Cache**: Redis (via ioredis)
- **Containerization**: Docker + docker-compose
- **UI Components**: shadcn/ui + Tailwind CSS

## Project Structure

```
HWAIDashboard/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── db/             # PostgreSQL client + queries
│   │   ├── cache/          # Redis client + helpers
│   │   ├── middleware/     # Auth, error handling, logging
│   │   └── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Chart components + UI
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls (axios)
│   │   ├── utils/          # Data transformation helpers
│   │   └── lib/            # Utility functions
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start

### Using Docker (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   cd HWAIDashboard
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your local PostgreSQL and Redis connection strings:
   ```
   PORT=3001
   DATABASE_URL=postgresql://user:password@localhost:5432/dashboarddb
   REDIS_URL=redis://localhost:6379
   CACHE_TTL=300
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB + Redis connectivity) |
| GET | `/api/dashboard/meta` | Returns chart configuration (cached) |
| GET | `/api/dashboard/data` | Returns all chart data (cached) |
| GET | `/api/dashboard/:chartId` | Returns data for a specific chart (cached) |

## Caching

- **Default TTL**: 300 seconds (5 minutes)
- **Cache Key Pattern**: `dashboard:{endpoint}:{params_hash}`
- Redis caching is automatically applied via middleware

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `CACHE_TTL` | Cache time-to-live in seconds | 300 |

## Docker Services

| Service | Image | Port |
|---------|-------|------|
| postgres | postgres:15 | 5432 |
| redis | redis:7-alpine | 6379 |
| backend | node:18-alpine | 3001 |
| frontend | nginx:alpine | 3000 |

All services run on a shared network called `dashboard-network`.

## Features

- **Responsive Dashboard**: 3-column CSS Grid layout with responsive breakpoints
- **Real-time Data**: Fetches data from backend API with loading states
- **Caching Layer**: Redis-based caching for improved performance
- **Health Monitoring**: Health check endpoint for DB and Redis connectivity
- **Error Handling**: Centralized error handling with structured responses
- **Loading Skeletons**: Smooth loading experience with skeleton placeholders
- **Global Filters**: Dropdown filters for data filtering

## Chart Components

1. **ChartOne**: Line chart for revenue trends
2. **ChartTwo**: Bar chart for user analytics
3. **ChartThree**: Area chart for performance metrics
4. **ChartFour**: Pie chart for distribution analysis

Each chart component accepts:
- `data`: Chart data array
- `title`: Chart title string
- `loading`: Boolean for loading state

## License

MIT
