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

/** Single product log. Keep this file in sync with src/app/core/releases.ts */
export const RELEASES: Release[] = [
  {
    date: '11 Sep 2026',
    version: '0.0.1',
    frontend: [
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
    ],
    backend: [
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
    ],
  },
];
