# Changelog

All notable changes to Little Royals School OS.

## 11 Sep 2026

### PostgreSQL backend
- API reads and writes school data from Postgres (`littleroyals` database).
- `.env` / `.env.example` hold `DATABASE_URL` and auth token hours.
- Tables are created on boot, with unique and lookup indexes on users, students, applicants, attendance, invoices, stock, visits, staff, permissions, and the change log.
- Demo records seed once when the database is empty.

### Official PDFs
- Server builds PDFs with pdfkit. The Angular app only requests and displays them.
- Templates: report card, sickbay / sick leave, staff leave, student ID, admission letter, transfer certificate, completion certificate, fee statement, payslip, visitor badge.
- `GET /api/documents` lists templates. `GET /api/documents/:key/pdf` returns the file.
- Documents, Report cards, and Health can open the PDF viewer and download the file.

### Change log
- `change_log` table records sign-in, enrolments, application moves, and PDF generation.
- `GET /api/changelog` feeds the live list on Permissions.
- This file records product releases for the repo.

### Admissions and forms
- Admissions opens in a right-side drawer, same pattern as Add student.
- New admission numbers use the short year: `LR26001`.
- Forms validate names, class, dates, Uganda phones, NIN / LIN / Schoolpay, and strip markup before save.

### Reports
- Module reports and the report-card index use live pupils, applications, fees, and attendance.
- Header Report still prints or downloads CSV.

### Auth
- Login and demo roles issue a Bearer token.
- School routes require the token. Parents cannot write records. Teachers and accountants have limited writes.

## Earlier

- Kindergarten and primary only (Baby–Top, P1–P7).
- Paper application form on Admissions.
- Role-based navigation.
- Report card page for every pupil.
- List, detail, and report pages for each School OS module.
- Angular app deployed for Vercel as Little Royals.
