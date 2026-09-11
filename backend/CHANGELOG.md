# Backend changelog

Nest API. Same dates and titles as [src/CHANGELOG.md](../src/CHANGELOG.md). Source: [src/releases.ts](src/releases.ts). Served at `GET /api/releases`.

## 11 Sep 2026 · v0.0.1

### Feedback PDF
`GET /documents/feedback/pdf?kind=parent|teacher|visitor` prints a rated form. Optional `event`, `name`, `adm`, `scores` and `note`. Blank circles if scores are omitted.

### Platform stack
JWT + Passport, Prisma, Redis/BullMQ, S3/MinIO, OpenSearch, Pino, Prometheus, OpenTelemetry, Vault, Docker, Kubernetes and GitHub Actions. The API stays up if a sidecar is down. Docs at `/api/docs`.

### Teacher stores
Teacher roles may view, create and edit inventory. Accountant roles may view it. Existing permission rows are updated on API boot.

### Session permissions
Login, demo and `GET /auth/me` return the role’s permission rows so the web OS and Flutter app hide the same screens and buttons.

### RBAC API
`GET/POST /roles`, `DELETE /roles/:key`, `GET/PATCH /perms` and `GET /activities`. Writes are allowed only when the role has create or edit on that activity.

### Staff clock API
`POST /clock/in`, `POST /clock/out`, `GET /clock/me`, `GET /clock/today`. Stored in `staff_clock` (Kampala time).

### PostgreSQL
School records, `change_log`, `staff_clock`, `roles` and `perms` live in Postgres and are created on boot.

### PDF API
`GET /documents/:key/pdf` returns official pdfkit files with `Content-Length`. `download=1` sends an attachment.

### Flutter clients
API listens on `0.0.0.0`. Login returns `token`, `tokenType` and `expiresIn`. `GET /status` and `GET /openapi.json`. Errors are `{ ok, statusCode, error, message }`. The teacher app lives in `/mobile`.

### Exams and register writes
`GET/POST /exams`, `POST /exams/sitting`, `PATCH /exams/:id`, `POST /calendar`, `POST /attendance/bulk`. Teachers may schedule papers.

### Kafka events
School writes publish to `littleroyals.school`. The API stays up if the broker is down. `GET /status` includes `kafka`. `POST /inventory` and `PATCH /health/:id`.

## Earlier

- Nest auth (`/auth/login`, `/auth/demo`) and school routes
- Bearer token on school routes
