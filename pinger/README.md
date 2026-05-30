# Upblitpinger

`Upblitpinger` owns the active uptime polling loop. It still exposes `/health`, but its background worker reads monitors, checks URLs every 30 seconds, and writes results.

## Layout

- `cmd/upblitpinger` - service entrypoint
- `internal/app` - runtime wiring and startup
- `internal/config` - environment loading and validation

The Spring Boot backend now owns uptime monitor creation, listing, and history queries.

## Environment

- `POSTGRES_URL` - required PostgreSQL connection string
- `MONGODB_URI` - required MongoDB connection string
- `MONGODB_DATABASE` - defaults to `observability`
- `UPTIME_COLLECTION` - defaults to `uptime`
- `HTTP_ADDR` - defaults to `:8085`
- `UPTIME_TABLE` - defaults to `uptime_monitors`

## Endpoints

- `GET /health` - health check

## Spring backend uptime API

The Spring backend now owns the uptime CRUD/query workflow:

- `POST /uptime/monitors` - create a monitor
- `GET /uptime/monitors` - list monitors
- `GET /uptime/monitors/{monitorId}/results` - read monitor history

The pinger service polls those monitors every 30 seconds and writes the results to MongoDB.

## Run

```powershell
go run ./cmd/upblitpinger
```