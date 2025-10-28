# Flow Backend Services

This backend consists of two microservices:
1. **Indexer** - Listens to Flow blockchain events and stores them in PostgreSQL
2. **API** - REST API server for querying event data

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL running on host at `localhost:5432`
- Flow emulator running on host at `localhost:3569`

## Environment Variables

Both services use the following environment variables (configured in `docker-compose.yml`):

```bash
DATABASE_URL=postgres://postgres:mypassword@host.docker.internal:5432/postgres?sslmode=disable
FLOW_EMULATOR_HOST=host.docker.internal:3569
PRIVATE_KEY=
PRIVATE_KEY2=
PRIVATE_KEY_A=
PRIVATE_KEY_B=
```

## Quick Start

### 1. Start All Services

```bash
# Build and start both services
docker-compose up --build -d

# Or start without rebuilding
docker-compose up -d
```

### 2. View Logs

```bash
# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# View indexer logs only
docker-compose logs -f indexer
```

### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Service Details

### API Service

- **Container Name**: `flow-api`
- **Port**: `6666`
- **Endpoints**:
  - `POST /event/create` - Create new event
  - `GET /event/:id` - Get event by ID
  - `GET /event/` - Get all events (with pagination)
  - `POST /event/check-in` - Check-in to event
- **Health Check**: `curl http://localhost:6666/event/`

### Indexer Service

- **Container Name**: `flow-indexer`
- **Function**: Subscribes to Flow blockchain events and stores them in database
- **Events Monitored**:
  - `EventCreated`
  - `UserRegistered`
  - `UserUnregistered`
  - `EventStatus`

## Docker Files

- `Dockerfile` - Builds the indexer service
- `Dockerfile.api` - Builds the API service
- `docker-compose.yml` - Orchestrates both services

## Architecture

```
┌─────────────────┐
│  Flow Emulator  │ (host:3569)
│  (on host)      │
└────────┬────────┘
         │
         │ gRPC Events
         │
┌────────▼────────┐
│   Indexer       │ (container)
│  Service        │
└────────┬────────┘
         │
         │ Writes Events
         │
┌────────▼────────┐      ┌─────────────────┐
│  PostgreSQL     │◄─────┤   API Service   │ (container:6666)
│  (on host)      │      │                 │
└─────────────────┘      └────────┬────────┘
                                  │
                                  │ HTTP REST
                                  │
                         ┌────────▼────────┐
                         │   Frontend      │
                         │   Clients       │
                         └─────────────────┘
```

## Development

### Rebuilding After Code Changes

```bash
# Rebuild specific service
docker-compose build api
docker-compose build indexer

# Rebuild all and restart
docker-compose up --build -d
```

### Accessing Container Shell

```bash
# Access API container
docker exec -it flow-api sh

# Access indexer container
docker exec -it flow-indexer sh
```

### Database Connection from Host

The services connect to PostgreSQL on the host machine:

```
Host: host.docker.internal
Port: 5432
User: postgres
Password: mypassword
Database: postgres
```

## Troubleshooting

### Services Keep Restarting

Check logs for specific errors:
```bash
docker-compose logs api
docker-compose logs indexer
```

### Cannot Connect to Database

1. Ensure PostgreSQL is running on host: `pg_isadmin`
2. Verify credentials in `docker-compose.yml`
3. Check if port 5432 is accessible

### Cannot Connect to Flow Emulator

1. Ensure Flow emulator is running: `flow emulator --start`
2. Verify emulator is on port 3569
3. Check `FLOW_EMULATOR_HOST` in `docker-compose.yml`

### Port 6666 Already in Use

Change the API port in `docker-compose.yml`:
```yaml
ports:
  - "8080:6666"  # Use port 8080 on host instead
```

## API Testing

### Get All Events

```bash
curl http://localhost:6666/event/
```

### Get Event by ID

```bash
curl http://localhost:6666/event/1
```

### Create Event (Example)

```bash
curl -X POST http://localhost:6666/event/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "A test event",
    "venue": "Test Venue",
    "date": "2025-12-01T10:00:00Z",
    "capacity": 100,
    "ticketPrice": 50000
  }'
```

## Production Deployment

For production deployment:

1. **Update environment variables** in `docker-compose.yml`:
   - Use production database credentials
   - Point to production Flow network (testnet/mainnet)
   - Add proper private keys

2. **Enable HTTPS** with reverse proxy (nginx/traefik)

3. **Add health checks** in docker-compose:
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:6666/event/"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

4. **Configure logging** with proper log drivers

5. **Set resource limits**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```
