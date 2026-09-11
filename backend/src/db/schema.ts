export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id         serial PRIMARY KEY,
  email      text NOT NULL,
  name       text NOT NULL,
  role       text NOT NULL,
  label      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);

CREATE TABLE IF NOT EXISTS roles (
  key        text PRIMARY KEY,
  label      text NOT NULL,
  locked     boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school (
  id      integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name    text NOT NULL,
  motto   text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone   text NOT NULL DEFAULT '',
  email   text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  year    text NOT NULL DEFAULT '2026',
  term    text NOT NULL DEFAULT 'Term 2'
);

CREATE TABLE IF NOT EXISTS students (
  adm            text PRIMARY KEY,
  first_name     text NOT NULL,
  last_name      text NOT NULL,
  name           text NOT NULL,
  cls            text NOT NULL,
  gender         text NOT NULL DEFAULT '',
  dob            date,
  guardian       text NOT NULL DEFAULT '',
  guardian_phone text NOT NULL DEFAULT '',
  attendance     text NOT NULL DEFAULT '—',
  fee            text NOT NULL DEFAULT 'due' CHECK (fee IN ('due', 'cleared')),
  fee_label      text NOT NULL DEFAULT 'Not yet invoiced'
);
CREATE INDEX IF NOT EXISTS students_cls_idx ON students (cls);
CREATE INDEX IF NOT EXISTS students_fee_idx ON students (fee);
CREATE INDEX IF NOT EXISTS students_cls_fee_idx ON students (cls, fee);
CREATE INDEX IF NOT EXISTS students_name_lower_idx ON students (lower(name));

CREATE TABLE IF NOT EXISTS applicants (
  id           bigserial PRIMARY KEY,
  adm          text,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  name         text NOT NULL,
  cls          text NOT NULL,
  stage        text NOT NULL DEFAULT 'applied',
  meta         text NOT NULL DEFAULT '',
  lin          text NOT NULL DEFAULT '',
  father_name  text NOT NULL DEFAULT '',
  mother_name  text NOT NULL DEFAULT '',
  father_phone text NOT NULL DEFAULT '',
  mother_phone text NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS applicants_adm_uidx ON applicants (adm) WHERE adm IS NOT NULL;
CREATE INDEX IF NOT EXISTS applicants_stage_idx ON applicants (stage);
CREATE INDEX IF NOT EXISTS applicants_cls_idx ON applicants (cls);
CREATE INDEX IF NOT EXISTS applicants_stage_cls_idx ON applicants (stage, cls);
CREATE INDEX IF NOT EXISTS applicants_name_lower_idx ON applicants (lower(name));

CREATE TABLE IF NOT EXISTS attendance (
  adm    text PRIMARY KEY REFERENCES students (adm) ON UPDATE CASCADE ON DELETE CASCADE,
  name   text NOT NULL,
  cls    text NOT NULL,
  status text NOT NULL DEFAULT 'P' CHECK (status IN ('P', 'A', 'L', 'E'))
);
CREATE INDEX IF NOT EXISTS attendance_status_idx ON attendance (status);
CREATE INDEX IF NOT EXISTS attendance_cls_status_idx ON attendance (cls, status);

CREATE TABLE IF NOT EXISTS invoices (
  id          text PRIMARY KEY,
  student     text NOT NULL,
  student_adm text REFERENCES students (adm) ON UPDATE CASCADE ON DELETE SET NULL,
  total       integer NOT NULL DEFAULT 0,
  paid        integer NOT NULL DEFAULT 0,
  balance     integer NOT NULL DEFAULT 0,
  status      text NOT NULL
);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);
CREATE INDEX IF NOT EXISTS invoices_student_adm_idx ON invoices (student_adm);

CREATE TABLE IF NOT EXISTS stock (
  id       serial PRIMARY KEY,
  name     text NOT NULL,
  category text NOT NULL,
  qty      integer NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS stock_category_idx ON stock (category);

CREATE TABLE IF NOT EXISTS visits (
  id       bigserial PRIMARY KEY,
  adm      text NOT NULL REFERENCES students (adm) ON UPDATE CASCADE ON DELETE CASCADE,
  name     text NOT NULL,
  reason   text NOT NULL,
  action   text NOT NULL,
  time     text NOT NULL,
  notified boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS visits_adm_idx ON visits (adm);
CREATE INDEX IF NOT EXISTS visits_notified_idx ON visits (notified);

CREATE TABLE IF NOT EXISTS events (
  id       serial PRIMARY KEY,
  title    text NOT NULL,
  date     text NOT NULL,
  type     text NOT NULL,
  audience text NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id     text PRIMARY KEY,
  name   text NOT NULL,
  role   text NOT NULL,
  dept   text NOT NULL,
  status text NOT NULL
);
CREATE INDEX IF NOT EXISTS staff_dept_idx ON staff (dept);
CREATE INDEX IF NOT EXISTS staff_status_idx ON staff (status);

CREATE TABLE IF NOT EXISTS perms (
  id          serial PRIMARY KEY,
  role        text NOT NULL,
  module      text NOT NULL,
  can_view    boolean NOT NULL DEFAULT false,
  can_create  boolean NOT NULL DEFAULT false,
  can_edit    boolean NOT NULL DEFAULT false,
  can_approve boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS perms_role_module_uidx ON perms (role, module);

CREATE TABLE IF NOT EXISTS change_log (
  id         bigserial PRIMARY KEY,
  who        text NOT NULL,
  action     text NOT NULL,
  module     text NOT NULL,
  detail     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS change_log_created_idx ON change_log (created_at DESC);
CREATE INDEX IF NOT EXISTS change_log_module_idx ON change_log (module);

CREATE TABLE IF NOT EXISTS staff_clock (
  id         bigserial PRIMARY KEY,
  email      text NOT NULL,
  who        text NOT NULL,
  role       text NOT NULL,
  clock_in   timestamptz NOT NULL DEFAULT now(),
  clock_out  timestamptz
);
CREATE INDEX IF NOT EXISTS staff_clock_email_idx ON staff_clock (lower(email), clock_in DESC);
CREATE INDEX IF NOT EXISTS staff_clock_in_idx ON staff_clock (clock_in DESC);
CREATE UNIQUE INDEX IF NOT EXISTS staff_clock_open_uidx ON staff_clock (lower(email)) WHERE clock_out IS NULL;
`;
