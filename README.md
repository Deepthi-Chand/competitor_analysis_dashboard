# HWAIDashboard

A production-ready full-stack dashboard application built with Node.js, Express, React, PostgreSQL, and Redis.

## 🚀 Key Highlights

- **Sample Data**: Includes comprehensive dummy data for 2023 to demonstrate historical trends and year-over-year analytics
- **Performance Optimized**: Built-in Redis caching with configurable TTL and rate limiting for API protection
- **Well Documented**: Complete API documentation with Swagger UI, architecture guides, and development instructions
- **Production Ready**: Docker containerization, health monitoring, error handling, and environment-based configuration

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
| GET | `/api/dashboard/filter-options` | Returns all available filter values (cached) |
| GET | `/api/dashboard/market-highlights` | Returns enrollment snapshots with growth metrics |
| GET | `/api/dashboard/monthly-trend` | Monthly enrollment trends by organization |
| GET | `/api/dashboard/market-share` | Market share analysis with growth comparisons |
| GET | `/api/dashboard/bottom-grid` | Historical data 2023-2025 with plan breakdowns |

📚 **Full API documentation available at:**
- Interactive Swagger UI: `http://localhost:3001/api-docs`
- Detailed API Reference: `/docs/api.md`

## Performance Features

### Caching
- **Redis Cache-Aside Pattern**: Automatic caching for all dashboard endpoints
- **Default TTL**: 300 seconds (5 minutes in development)
- **Production TTL**: 86,400 seconds (24 hours)
- **Cache Key Pattern**: `dashboard:{endpoint}:{sha256(params)[:16]}`
- **Configurable**: Set via `CACHE_TTL` environment variable

### Rate Limiting
- **Built-in Protection**: Prevents API abuse and ensures fair usage
- **Configurable Limits**: Adjust based on your requirements
- **Error Response**: Returns 429 status when limit exceeded

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
- **Historical Analytics**: Includes 2023 dummy data for year-over-year comparisons
- **Advanced Filtering**: Multi-dimensional filters by region, state, county, plan types
- **Performance Optimized**: Redis caching + rate limiting for production readiness
- **Health Monitoring**: Health check endpoint for DB and Redis connectivity
- **Error Handling**: Centralized error handling with structured responses
- **Loading Skeletons**: Smooth loading experience with skeleton placeholders
- **TypeScript**: Full type safety across backend and frontend

## Chart Components

1. **Market Highlights**: Key enrollment metrics with period comparisons
2. **Monthly Trend**: Line chart showing enrollment trends by organization
3. **Market Share**: Pie chart with growth rate indicators
4. **Bottom Grid**: Comprehensive 3-year analysis (2023-2025) with:
   - Market share trends
   - Plan count evolution
   - Enrollment growth
   - Plan type distribution

Each chart component accepts:
- `data`: Chart data array
- `title`: Chart title string
- `loading`: Boolean for loading state

## Documentation

- 📖 **API Reference**: `/docs/api.md` - Complete endpoint documentation with examples
- 🏗️ **Architecture Guide**: `/docs/architecture.md` - System design and components
- 💻 **Development Guide**: `/docs/development.md` - Local setup instructions
- 🚀 **Deployment Guide**: `/docs/deployment.md` - Production deployment steps
- 🔧 **Troubleshooting**: `/docs/troubleshooting.md` - Common issues and solutions

## License

MIT
