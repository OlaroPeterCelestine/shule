# Changelog

Little Royals School OS — **11 Sep 2026** · v0.0.1

The app and API share the same release list:

- Frontend: [src/app/core/releases.ts](src/app/core/releases.ts) and [src/CHANGELOG.md](src/CHANGELOG.md)
- Backend: [backend/src/releases.ts](backend/src/releases.ts) and [backend/CHANGELOG.md](backend/CHANGELOG.md)
- Live copy: `GET /api/releases` (same JSON the dashboard What’s new card uses)

Keep those two `releases.ts` files identical. Staff actions (sign-in, enrol, clock) stay on **Permissions → Change log**.

## 11 Sep 2026 — App

- Timetable and exam sittings are separate tabs; the browser icon is the school crest
- Documents can be addressed to a pupil’s guardian
- Pupil file: each student has reports, behaviour, health, fees, attendance and documents on one page
- Feedback forms: generate parent, teacher or visitor PDFs (blank pack or filled scores)
- Inventory / Stores on the web home and Flutter app (teachers stock in and issue; accountants can view)
- Home, sidebar, write buttons and the Flutter tabs follow the signed-in role and its permissions (nurse and registrar demos included)
- Custom roles on Permissions, with view / create / edit / approve per activity
- Teacher clock in and out on the dashboard and My profile
- Official PDFs in the in-app viewer
- Live audit list on Permissions
- Admissions drawer and `LR26001` admission numbers
- Teacher Flutter app in `/mobile` (clock, register, pupils, sickbay, report-card PDF)
- End-of-term exam sittings on Timetable & Exams; attendance and exams persist through the API
- Admin home and sidebar ordered as a school day (enrol, class, fees, campus)
- Paginated lists (8 per page) and live form saves for enrol, sickbay, inventory, school profile, calendar and exams
- Copy and sample numbers are kindergarten and primary only (Baby–P7, ~186 pupils) — no S6 or secondary roll

## 11 Sep 2026 — API

- Platform stack: JWT, Prisma, Redis/BullMQ, MinIO, OpenSearch, Pino, Prometheus, OpenTelemetry, Vault, Docker Compose, Kubernetes and GitHub Actions. `/api/status` reports each sidecar. Swagger at `/api/docs`
- Login, demo and `GET /auth/me` return that role’s permission rows
- `/roles`, `/perms`, `/activities` and RBAC on writes
- `/clock/in`, `/clock/out`, `/clock/me`, `/clock/today`
- PostgreSQL for school records, clock, roles and the audit log
- `/documents/feedback/pdf` parent, teacher and visitor forms (`kind`, `event`, `scores`, `note`)
- `/documents/:key/pdf` with `Content-Length`
- Flutter-friendly JSON, CORS, `/status` and `/openapi.json`
- Kafka topic `littleroyals.school` for school writes; `/status` reports broker health. `POST /inventory` and `PATCH /health/:id`

## Earlier

- Kindergarten and primary only (Baby–Top, P1–P7)
- Paper application form and role-based navigation
- Report card page for every pupil
- Angular app on Vercel as Little Royals
