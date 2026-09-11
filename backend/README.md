# Little Royals School OS API

NestJS backend for auth and school records, stored in PostgreSQL.

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API base: `http://localhost:3000/api`

The API listens on `0.0.0.0` so Flutter (emulator or a phone on the LAN) can reach it. The Angular app still proxies `/api` when you run `npm start` from the repo root.

`GET /api/status` — readiness (`{ ok, name, version, time }`)  
`GET /api/releases` — product changelog (same dates as the Angular What’s new card)  
`GET /api/openapi.json` — OpenAPI 3 spec for Dart client generation

Release notes: [CHANGELOG.md](CHANGELOG.md) (keep in step with [../src/CHANGELOG.md](../src/CHANGELOG.md)).

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
| POST | `/auth/login` | `{ email, password }` or `{ username, password }` → `{ token, tokenType, expiresIn, user }` |
| POST | `/auth/demo` | `{ role }` → `{ token, tokenType, expiresIn, user }` |
| GET | `/auth/me` | Bearer token |
| POST | `/auth/logout` | `{ ok: true }` |

Send `Authorization: Bearer <token>` on every school route. Errors are JSON: `{ ok: false, statusCode, error, message }`.

Writes follow the permission matrix. Admin always can. Other roles (including custom ones) need create or edit on that activity. Parents start with no writes.

`GET /activities` · `GET/POST /roles` · `DELETE /roles/:key` · `GET/PATCH /perms`

## School routes

`GET/PATCH /school` · `GET/POST /students` · `GET/POST/PATCH /admissions` · `GET/PATCH /attendance/:adm` · `GET /finance` · `GET/PATCH /inventory/:id` · `GET/POST /health` · `GET /calendar` · `GET /staff` · `GET /clock/me` · `GET /clock/today` · `POST /clock/in` · `POST /clock/out` · `GET /perms` · `GET /changelog` · `GET /reports` · `GET /reports/cards`

Sign-in, enrolments, application moves, attendance, sickbay, stock issues, school profile edits, teacher clock in/out, and PDF generation are written to `change_log` and shown on Permissions.

Teachers clock in and out with `POST /clock/in` and `POST /clock/out`. `GET /clock/me` is their punches. `GET /clock/today` is the campus board for Staff & HR.

## PDFs

The API builds official PDFs. The Angular app only requests and displays them.

`GET /documents` — template list  
`GET /documents/:key/pdf?adm=&staff=&applicant=&visit=&download=` — PDF (`Content-Length` set; `download=1` for attachment)

Keys: `report-card`, `sick-leave`, `staff-leave`, `student-id`, `admission-letter`, `transfer-certificate`, `completion-certificate`, `fee-statement`, `payslip`, `visitor-badge`.

New pupils and applicants receive admission numbers like `LR26001`.

## Flutter

JSON + Bearer token. No cookies. CamelCase fields. Generate a Dart client from `/api/openapi.json` if you want.

| Client | Base URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:3000/api` |
| iOS simulator | `http://127.0.0.1:3000/api` |
| Physical device | `http://<your-computer-LAN-IP>:3000/api` |
| Flutter web (local) | `http://localhost:3000/api` |

Android cleartext: allow HTTP in debug (`android:usesCleartextTraffic="true"` on the application, or a network security config).

```dart
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: 'http://10.0.2.2:3000/api',
  headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
));

Future<void> signIn(String email, String password) async {
  final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
  final token = res.data['token'] as String;
  dio.options.headers['Authorization'] = 'Bearer $token';
}

Future<List<dynamic>> students() => dio.get('/students').then((r) => r.data as List);
```

Teacher clock: `POST /clock/in` and `POST /clock/out`. PDFs: `GET /documents/report-card/pdf?adm=LR26001` as bytes (`responseType: ResponseType.bytes`).
