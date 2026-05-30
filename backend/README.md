# Upblit Backend Uptime

The Spring Boot backend owns uptime monitor creation and uptime queries.

## Routes

- `POST /uptime/monitors` - create a monitor
- `GET /uptime/monitors` - list monitors, optionally filtered by `projectId`
- `GET /uptime/monitors/{monitorId}/results` - read history for a monitor, optionally filtered by `from` and `to`

## Storage

- PostgreSQL stores monitor metadata in `uptime_monitors`
- MongoDB stores check history in the `uptime` collection

## Patreon membership sync

The backend can sync Patreon campaign members to user plans so Supernova patrons stay upgraded and are demoted back to Pirates if the membership lapses.

Set these environment variables before starting the backend:

```powershell
PATREON_ENABLED=true
PATREON_CLIENT_ID=your_patreon_client_id
PATREON_CLIENT_SECRET=your_patreon_client_secret
PATREON_JOIN_URL=https://www.patreon.com/Upblit
PATREON_CALLBACK_URL=https://api.upblit.dev/auth/patreon/callback
PATREON_CREATOR_ACCESS_TOKEN=your_creator_access_token
PATREON_CREATOR_REFRESH_TOKEN=your_creator_refresh_token
PATREON_CREATOR_TOKEN_EXPIRES_AT=2026-06-01T00:00:00Z
PATREON_CAMPAIGN_ID=your_campaign_id
PATREON_SUPERNOVA_TIER_TITLE=Supernova
PATREON_SUPERNOVA_TIER_AMOUNT_CENTS=2000
PATREON_USER_AGENT=Upblit Patreon Sync
```

If `PATREON_CREATOR_TOKEN_EXPIRES_AT` is omitted, the backend will keep using the current access token until you replace it. If you do set it, use an ISO-8601 timestamp like `2026-06-01T00:00:00Z`.

The pricing page now points to `GET /patreon/subscribe`, which redirects through the backend to your configured Patreon join URL. Patreon should send OAuth callbacks to `https://api.upblit.dev/auth/patreon/callback` so the backend can exchange the code and keep the creator token in sync.

The sync job calls Patreon’s v2 campaign members API, checks for active Supernova entitlement, and updates matching users by Patreon user ID or email.

## Polling

Polling is handled by the pinger service, which reads saved monitors and checks each URL every 30 seconds.

## Run

Use the existing Spring Boot wrapper in `backend/`:

```powershell
Set-Location 'c:\Workspace\Upblit\Upblit\backend'
.\mvnw spring-boot:run
```