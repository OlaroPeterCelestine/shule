# Little Royals School OS API

NestJS backend for auth and school records, stored in PostgreSQL.

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API base: `http://localhost:3000/api`

The Angular app proxies `/api` there when you run `npm start` from the repo root.

## Database

`.env` points at:

`postgresql://littleroyals:littleroyals@127.0.0.1:5432/littleroyals`

Create the role and database once:

```bash
psql -h 127.0.0.1 -d postgres -c "CREATE ROLE littleroyals LOGIN PASSWORD 'littleroyals';"
psql -h 127.0.0.1 -d postgres -c "CREATE DATABASE littleroyals OWNER littleroyals;"
```

On boot the API creates tables, unique and lookup indexes, and seeds demo data if the `users` table is empty.

Indexed for the common lookups: user email/role, student class/fee/name, applicant stage/class/admission number, attendance status, invoice status, stock category, sickbay visits, staff department, and permission role+module.

## Auth

Demo accounts (any password of 4+ characters):

- `admin@littleroyals.ac.ug`
- `teacher@littleroyals.ac.ug`
- `accountant@littleroyals.ac.ug`
- `parent@littleroyals.ac.ug`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` → `{ token, user }` |
| POST | `/auth/demo` | `{ role }` → `{ token, user }` |
| GET | `/auth/me` | Bearer token |
| POST | `/auth/logout` | Clears the client session |

Send `Authorization: Bearer <token>` on every school route.

Admins can write everything. Teachers can write students, admissions, attendance and health. Accountants can write finance. Parents are read-only.

## School routes

`GET/PATCH /school` · `GET/POST /students` · `GET/POST/PATCH /admissions` · `GET/PATCH /attendance/:adm` · `GET /finance` · `GET/PATCH /inventory/:id` · `GET/POST /health` · `GET /calendar` · `GET /staff` · `GET /perms` · `GET /changelog` · `GET /reports` · `GET /reports/cards`

Sign-in, enrolments, application moves, attendance, sickbay, stock issues, school profile edits, and PDF generation are written to `change_log` and shown on Permissions.

## PDFs

The API builds official PDFs. The Angular app only requests and displays them.

`GET /documents` — template list  
`GET /documents/:key/pdf?adm=&staff=&applicant=&visit=` — PDF (inline)

Keys: `report-card`, `sick-leave`, `staff-leave`, `student-id`, `admission-letter`, `transfer-certificate`, `completion-certificate`, `fee-statement`, `payslip`, `visitor-badge`.

New pupils and applicants receive admission numbers like `LR26001`.
