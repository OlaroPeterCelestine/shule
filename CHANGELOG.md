# Changelog

Little Royals School OS — **11 Sep 2026** · v0.0.1

The app and API share the same release list:

- Frontend: [src/app/core/releases.ts](src/app/core/releases.ts) and [src/CHANGELOG.md](src/CHANGELOG.md)
- Backend: [backend/src/releases.ts](backend/src/releases.ts) and [backend/CHANGELOG.md](backend/CHANGELOG.md)
- Live copy: `GET /api/releases` (same JSON the dashboard What’s new card uses)

Keep those two `releases.ts` files identical. Staff actions (sign-in, enrol, clock) stay on **Permissions → Change log**.

## 11 Sep 2026 — App

- Custom roles on Permissions, with view / create / edit / approve per activity
- Teacher clock in and out on the dashboard and My profile
- Official PDFs in the in-app viewer
- Live audit list on Permissions
- Admissions drawer and `LR26001` admission numbers

## 11 Sep 2026 — API

- `/roles`, `/perms`, `/activities` and RBAC on writes
- `/clock/in`, `/clock/out`, `/clock/me`, `/clock/today`
- PostgreSQL for school records, clock, roles and the audit log
- `/documents/:key/pdf` with `Content-Length`
- Flutter-friendly JSON, CORS, `/status` and `/openapi.json`

## Earlier

- Kindergarten and primary only (Baby–Top, P1–P7)
- Paper application form and role-based navigation
- Report card page for every pupil
- Angular app on Vercel as Little Royals
