# Sensor API - Hapi + PostgreSQL

REST API for sensor data collection and retrieval, built with Hapi.js and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ (installed and running locally)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

Make sure PostgreSQL is installed and running:

```bash
# Check if PostgreSQL is running
psql --version

# If not installed on macOS:
brew install postgresql@14
brew services start postgresql@14

# If not running:
brew services start postgresql
```

Create the database and user:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE sensordata;

# Create sensoradmin user
CREATE USER sensoradmin WITH PASSWORD 'sensorpassword';

# Grant all privileges on the database to sensoradmin
GRANT ALL PRIVILEGES ON DATABASE sensordata TO sensoradmin;

# Connect to the database
\c sensordata

# Grant schema permissions
GRANT ALL ON SCHEMA public TO sensoradmin;

# Verify database and user were created
\l
\du

# Exit psql
\q
```

### 3. Configure Database Connection

The database configuration is in `config.js`:

```javascript
development: {
  host: '127.0.0.1',
  port: 5432,
  database: 'sensordata',
  user: 'sensoradmin',
  password: 'sensorpassword',
},
```

### 4. Run Database Migrations

```bash
npx knex migrate:latest
```

This creates all the required tables:
- `device` - Sensor devices
- `reading` - Sensor readings
- `user` - API users
- `auth` - API keys

### 5. Seed Test Data (Optional)

For testing and development, seed the database with test data:

```bash
npx knex seed:run
```

This creates:
- 3 devices (2 enabled, 1 disabled)
- ~2,335 readings per device with realistic intervals
- 1 test user: `testuser` / `testpassword`
- 1 API key: `test-api-key-12345`

**Test Data Structure:**
- Fixed reference date: **February 12, 2026 10:00 AM**
- Yesterday (Feb 11): 144 readings (every 10 minutes)
- Day before yesterday (Feb 10): 144 readings (every 10 minutes)
- Current day (Feb 12, 00:00-10:00): 20 readings (every 30 minutes)
- Previous 5 days: 240 readings (every 30 minutes)
- January 2026: 744 readings (hourly)
- December 2025: 31 readings (daily)
- 2025 months: 12 readings (monthly)

### 6. Start the Development Server

```bash
npm start
```

The server will start on **http://localhost:8000** with hot-reload enabled (nodemon).

**Or manually compile and start:**

```bash
npm run compile
```

## Project Structure

```
sensor_api-OLD/
├── routes/              # API route handlers
│   ├── auth/            # Authentication routes
│   ├── devices/         # Device CRUD routes
│   ├── readings/        # Sensor readings routes
│   ├── latest/          # Latest readings routes
│   └── statistics/      # Statistics routes
├── data/                # Database access layer (Knex queries)
├── auth/                # Authentication utilities
├── knex/
│   ├── migrations/      # Database schema migrations
│   └── seeds/           # Database seed scripts
├── types.ts             # TypeScript type definitions
├── server.ts            # Main server entry point
├── config.js            # Configuration (ports, database, auth)
└── knexfile.js          # Knex configuration
```

## API Endpoints

All endpoints require authentication (JWT token in `Authorization` header) except `/api/login`.

### Authentication

- `POST /api/login` - Login with username/password, returns JWT token

### Devices

- `GET /api/devices` - Get all devices
  - Query params: `limit`, `offset`, `includeDisabled`
- `GET /api/devices/:id` - Get single device
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device

### Readings

- `GET /api/devices/:id/readings` - Get readings for a device
  - Query params: `startTime`, `endTime`, `type`, `level`
- `GET /api/devices/readings` - Get readings for all devices
  - Query params: `startTime`, `endTime`, `type`, `level`, `limit`, `offset`
- `POST /api/devices/:id/readings` - Add new reading

### Latest Readings

- `GET /api/latest` - Get latest readings for all devices
  - Query params: `limit`, `offset`
- `GET /api/devices/:id/latest` - Get latest reading for a device

### Statistics

- `GET /api/statistics` - Get statistics for all devices
  - Query params: `startTime`, `endTime`, `limit`, `offset`
- `GET /api/devices/:id/statistics` - Get statistics for a device
  - Query params: `startTime`, `endTime`

## Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Setup test database:

```bash
npm run test:setup
```

## Database Migrations

Create a new migration:

```bash
npx knex migrate:make migration_name
```

Run migrations:

```bash
npx knex migrate:latest
```

Rollback last migration:

```bash
npx knex migrate:rollback
```

Check migration status:

```bash
npx knex migrate:status
```

## Database Schema

### device

| Column | Type | Description |
|--------|------|-------------|
| id | string (PK) | Device ID |
| name | string | Device name |
| location_x | integer | X coordinate |
| location_y | integer | Y coordinate |
| location_type | string | 'inside' or 'outside' |
| type | string | 'ruuvi' or 'sensorbug' |
| sensor_info | string | Additional sensor info |
| disabled | boolean | Whether device is disabled |
| order | integer | Display order |
| latest_reading | integer (FK) | Reference to latest reading |

### reading

| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-increment ID |
| device | string (FK) | Device ID |
| temperature | float | Temperature (°C) |
| humidity | float | Humidity (%) |
| pressure | float | Pressure (hPa) |
| lux | float | Light level |
| battery | float | Battery level (%) |
| created_at | timestamp | Reading timestamp |

### user

| Column | Type | Description |
|--------|------|-------------|
| username | string (PK) | Username |
| password | string | Hashed password |
| salt | string | Password salt |
| disabled | boolean | Whether user is disabled |

### auth

| Column | Type | Description |
|--------|------|-------------|
| api_key | string (PK) | API key |
| device | string (FK) | Associated device (nullable) |
| description | string | Key description |

## Configuration

Edit `config.js` to change:

- **Server port** (default: 8000 for development)
- **Database connection** (host, port, database name, user, password)
- **JWT secret** (default: 'bananabanana' for development)
- **Token expiration** times

## Common Issues

### Port 8000 already in use

Change the port in `config.js`:

```javascript
development: {
  port: 8001,  // Change to different port
  // ...
}
```
