export interface ReleaseItem {
  title: string;
  detail: string;
}

export interface Release {
  date: string;
  version: string;
  frontend: ReleaseItem[];
  backend: ReleaseItem[];
}

/** Single product log. Keep this file in sync with backend/src/releases.ts */
export const RELEASES: Release[] = [
  {
    date: '11 Sep 2026',
    version: '0.0.1',
    frontend: [
      {
        title: 'Feedback forms',
        detail: 'Feedback generates parent, teacher or visitor PDFs. Print a blank pack or fill scores first. Also listed on Documents and linked from Meetings.',
      },
      {
        title: 'Stores on both clients',
        detail: 'Teachers can stock in and issue from Inventory on the web and the Flutter Stores tab. Accountants can view. Home shows items below 20 units.',
      },
      {
        title: 'Roles change both clients',
        detail: 'Home, sidebar and write buttons follow the signed-in role. Nurse and registrar demos work. The Flutter app hides tabs and actions the role cannot use. Login and /auth/me return that role’s permissions.',
      },
      {
        title: 'Custom roles',
        detail: 'Permissions lets an admin create roles from school activities and tick view, create, edit or approve. The sidebar hides what a role cannot see.',
      },
      {
        title: 'Teacher clock',
        detail: 'Teachers clock in and out on the dashboard and My profile. Staff & HR shows who is on campus today.',
      },
      {
        title: 'Official PDFs',
        detail: 'Documents, report cards and Health open server-built PDFs in the in-app viewer.',
      },
      {
        title: 'Live audit',
        detail: 'Permissions shows the live change log from the API (sign-in, enrolments, clock, PDFs).',
      },
      {
        title: 'Admissions and forms',
        detail: 'Admissions opens in a right drawer. New numbers look like LR26001. Names, class, Uganda phones and IDs are checked before save.',
      },
      {
        title: 'Teacher mobile',
        detail: 'Flutter app in /mobile: teachers sign in, clock, mark today’s register, browse pupils, log sickbay, and open report-card PDFs.',
      },
      {
        title: 'End-of-term exams',
        detail: 'Timetable & Exams can create a sitting (one paper per subject on weekdays). Attendance marks now save to the API. The teacher app shows Baby–P7 roll call and the exam timetable.',
      },
      {
        title: 'Organised admin home',
        detail: 'Sidebar follows enrol → class → fees → campus. Home shows live queues (admissions, register, fees, exams) instead of a changelog and generic charts.',
      },
      {
        title: 'Pagination and live forms',
        detail: 'Long lists page 8 rows at a time. Enrol, admissions, sickbay, inventory, school profile, calendar and exam papers wait for the API and keep the form open if a save fails.',
      },
      {
        title: 'Kindergarten and primary only',
        detail: 'Copy and sample numbers match Seguku: Baby–Top and P1–P7, about 186 pupils and 24 staff. No secondary classes or S6 alumni.',
      },
    ],
    backend: [
      {
        title: 'Feedback PDF',
        detail: 'GET /documents/feedback/pdf?kind=parent|teacher|visitor prints a rated form. Optional event, name, adm, scores and note. Blank circles if scores are omitted.',
      },
      {
        title: 'Platform stack',
        detail: 'JWT + Passport, Prisma, Redis/BullMQ, MinIO, OpenSearch, Pino, Prometheus, OpenTelemetry, Vault, Docker, Kubernetes and GitHub Actions. School routes stay up if a sidecar is down. Swagger at /api/docs.',
      },
      {
        title: 'Session permissions',
        detail: 'Login, demo and GET /auth/me return the role’s permission rows so the web OS and Flutter app can hide the same screens and buttons.',
      },
      {
        title: 'RBAC API',
        detail: 'GET/POST /roles, DELETE /roles/:key, GET/PATCH /perms and GET /activities. Writes are allowed only when the role has create or edit on that activity.',
      },
      {
        title: 'Staff clock API',
        detail: 'POST /clock/in, POST /clock/out, GET /clock/me, GET /clock/today. Stored in staff_clock (Kampala time).',
      },
      {
        title: 'PostgreSQL',
        detail: 'School records, change_log, staff_clock, roles and perms live in Postgres and are created on boot.',
      },
      {
        title: 'PDF API',
        detail: 'GET /documents/:key/pdf returns official pdfkit files with Content-Length. download=1 sends an attachment.',
      },
      {
        title: 'Flutter clients',
        detail: 'API listens on 0.0.0.0. Login returns token, tokenType and expiresIn. GET /status and GET /openapi.json. Errors are { ok, statusCode, error, message }.',
      },
      {
        title: 'Exams API',
        detail: 'GET/POST /exams, POST /exams/sitting, PATCH /exams/:id, POST /calendar and POST /attendance/bulk. Papers persist in Postgres.',
      },
      {
        title: 'Kafka events',
        detail: 'School writes publish to topic littleroyals.school. The API stays up if the broker is down. GET /status includes kafka. POST /inventory and PATCH /health/:id persist stock and parent notify.',
      },
    ],
  },
];
