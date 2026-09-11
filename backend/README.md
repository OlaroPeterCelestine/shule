# Little Royals School OS API

NestJS backend for auth and school records.

```bash
cd backend
npm install
npm run start:dev
```

API base: `http://localhost:3000/api`

The Angular app proxies `/api` there when you run `npm start` from the repo root.

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

`GET/PATCH /school` · `GET/POST /students` · `GET/POST/PATCH /admissions` · `GET/PATCH /attendance/:adm` · `GET /finance` · `GET/PATCH /inventory/:id` · `GET/POST /health` · `GET /calendar` · `GET /staff` · `GET /perms` · `GET /reports` · `GET /reports/cards`

New pupils and applicants receive admission numbers like `LR26001`.
