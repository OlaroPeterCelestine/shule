# Frontend changelog

Angular School OS. Same dates and titles as [backend/CHANGELOG.md](../backend/CHANGELOG.md). Source: [src/app/core/releases.ts](app/core/releases.ts).

## 11 Sep 2026 · v0.0.1

### Timetable and exam sittings
Timetable & Exams is two tabs: the weekly class timetable, and exam sittings with papers and rooms. The browser icon is the school crest.

### Pupil file
Each pupil opens a file with overview, guardian, medical, campus, fees, attendance, sickbay, reports, behaviour and documents.

### Feedback forms
Feedback generates parent, teacher or visitor PDFs. Print a blank pack or fill scores first. Also listed on Documents and linked from Meetings.

### Platform stack
The API now reports JWT, Prisma, Redis, BullMQ, MinIO, OpenSearch, Pino, Prometheus, OpenTelemetry and Vault on `/api/status`. Swagger is at `/api/docs`.

### Stores on both clients
Teachers can stock in and issue from Inventory on the web and the Flutter Stores tab. Accountants can view. Home shows items below 20 units.

### Roles change both clients
Home, sidebar and write buttons follow the signed-in role. Nurse and registrar demos work. The Flutter app hides tabs and actions the role cannot use.

### Custom roles
Permissions lets an admin create roles from school activities and tick view, create, edit or approve. The sidebar hides what a role cannot see.

### Teacher clock
Teachers clock in and out on the dashboard and My profile. Staff & HR shows who is on campus today.

### Official PDFs
Documents, report cards and Health open server-built PDFs in the in-app viewer.

### Live audit
Permissions shows the live change log from the API (sign-in, enrolments, clock, PDFs).

### Admissions and forms
Admissions opens in a right drawer. New numbers look like LR26001. Names, class, Uganda phones and IDs are checked before save.

### Teacher mobile
Flutter app in `/mobile`: teachers sign in, clock, mark today’s register, browse pupils, log sickbay, and open report-card PDFs.

### End-of-term exams
Timetable & Exams creates a sitting (one paper per subject on weekdays). Attendance marks save to the API. The teacher app shows Baby–P7 roll call and the exam timetable.

### Organised admin home
Sidebar follows enrol → class → fees → campus. Home shows live queues instead of a changelog and generic charts.

### Pagination and live forms
Long lists page 8 rows at a time. Enrol, admissions, sickbay, inventory, school profile, calendar and exam papers wait for the API and keep the form open if a save fails.

### Kindergarten and primary only
Copy and sample numbers match Seguku: Baby–Top and P1–P7. No secondary classes or S6 alumni.

## Earlier

- Kindergarten and primary only (Baby–Top, P1–P7)
- Paper application form and role-based navigation
- Report card for every pupil
- List, detail and report pages for each module
