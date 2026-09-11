# Backend changelog

Nest API. Same dates and titles as [src/CHANGELOG.md](../src/CHANGELOG.md). Source: [src/releases.ts](src/releases.ts). Served at `GET /api/releases`.

## 11 Sep 2026 · v0.0.1

### RBAC API
`GET/POST /roles`, `DELETE /roles/:key`, `GET/PATCH /perms` and `GET /activities`. Writes are allowed only when the role has create or edit on that activity.

### Staff clock API
`POST /clock/in`, `POST /clock/out`, `GET /clock/me`, `GET /clock/today`. Stored in `staff_clock` (Kampala time).

### PostgreSQL
School records, `change_log`, `staff_clock`, `roles` and `perms` live in Postgres and are created on boot.

### PDF API
`GET /documents/:key/pdf` returns official pdfkit files with `Content-Length`. `download=1` sends an attachment.

### Flutter clients
API listens on `0.0.0.0`. Login returns `token`, `tokenType` and `expiresIn`. `GET /status` and `GET /openapi.json`. Errors are `{ ok, statusCode, error, message }`.

## Earlier

- Nest auth (`/auth/login`, `/auth/demo`) and school routes
- Bearer token on school routes
