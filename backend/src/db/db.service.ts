import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, type QueryResultRow } from 'pg';
import {
  APPLICANTS,
  DEMO_ACCOUNTS,
  EVENTS,
  INVOICES,
  REGISTER,
  SCHOOL,
  STAFF,
  STOCK,
  STUDENTS,
  VISITS,
} from '../data/seed.js';
import { SCHEMA_SQL } from './schema.js';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(DbService.name);
  readonly pool = new Pool(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, max: 10 }
      : {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          max: 10,
        },
  );

  async onModuleInit() {
    await this.query('SELECT 1');
    await this.pool.query(SCHEMA_SQL);
    await this.seedIfEmpty();
    await this.seedChangelogIfEmpty();
    await this.seedClockIfEmpty();
    this.log.log('Postgres ready');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  async one<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async logChange(who: string, action: string, module: string, detail = '') {
    await this.query(
      'INSERT INTO change_log (who, action, module, detail) VALUES ($1, $2, $3, $4)',
      [who || 'System', action, module, detail],
    );
  }

  async changes(limit = 50) {
    const rows = await this.query<{
      id: string;
      who: string;
      action: string;
      module: string;
      detail: string;
      when: string;
    }>(
      `SELECT id, who, action, module, detail, to_char(created_at, 'DD Mon YYYY HH24:MI') AS "when"
       FROM change_log ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return rows.map((r) => ({
      id: Number(r.id),
      who: r.who,
      action: r.action,
      module: r.module,
      detail: r.detail,
      when: r.when,
    }));
  }

  private async seedIfEmpty() {
    const users = await this.one<{ n: string }>('SELECT count(*)::text AS n FROM users');
    if (Number(users?.n) > 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const u of Object.values(DEMO_ACCOUNTS)) {
        await client.query(
          'INSERT INTO users (email, name, role, label) VALUES ($1, $2, $3, $4)',
          [u.email, u.name, u.role, u.label],
        );
      }
      await client.query(
        `INSERT INTO school (id, name, motto, address, phone, email, website, year, term)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)`,
        [SCHOOL.name, SCHOOL.motto, SCHOOL.address, SCHOOL.phone, SCHOOL.email, SCHOOL.website, SCHOOL.year, SCHOOL.term],
      );
      for (const s of STUDENTS) {
        await client.query(
          `INSERT INTO students (adm, first_name, last_name, name, cls, gender, dob, guardian, guardian_phone, attendance, fee, fee_label)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [s.adm, s.firstName, s.lastName, s.name, s.cls, s.gender, s.dob, s.guardian, s.guardianPhone, s.attendance, s.fee, s.feeLabel],
        );
      }
      for (const a of APPLICANTS) {
        await client.query(
          `INSERT INTO applicants (id, adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [a.id, a.adm || null, a.firstName, a.lastName, a.name, a.cls, a.stage, a.meta, a.lin, a.fatherName, a.motherName, '', ''],
        );
      }
      await client.query(`SELECT setval(pg_get_serial_sequence('applicants', 'id'), (SELECT COALESCE(MAX(id), 1) FROM applicants))`);
      for (const r of REGISTER) {
        await client.query(
          'INSERT INTO attendance (adm, name, cls, status) VALUES ($1,$2,$3,$4)',
          [r.adm, r.name, r.cls, r.status],
        );
      }
      const admByName = Object.fromEntries(STUDENTS.map((s) => [s.name, s.adm]));
      for (const i of INVOICES) {
        await client.query(
          'INSERT INTO invoices (id, student, student_adm, total, paid, balance, status) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [i.id, i.student, admByName[i.student] ?? null, i.total, i.paid, i.balance, i.status],
        );
      }
      for (const s of STOCK) {
        await client.query(
          'INSERT INTO stock (id, name, category, qty, location) VALUES ($1,$2,$3,$4,$5)',
          [s.id, s.name, s.category, s.qty, s.location],
        );
      }
      await client.query(`SELECT setval(pg_get_serial_sequence('stock', 'id'), (SELECT COALESCE(MAX(id), 1) FROM stock))`);
      for (const v of VISITS) {
        await client.query(
          'INSERT INTO visits (id, adm, name, reason, action, time, notified) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [v.id, v.adm, v.name, v.reason, v.action, v.time, v.notified],
        );
      }
      await client.query(`SELECT setval(pg_get_serial_sequence('visits', 'id'), (SELECT COALESCE(MAX(id), 1) FROM visits))`);
      for (const e of EVENTS) {
        await client.query(
          'INSERT INTO events (id, title, date, type, audience) VALUES ($1,$2,$3,$4,$5)',
          [e.id, e.title, e.date, e.type, e.audience],
        );
      }
      await client.query(`SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT COALESCE(MAX(id), 1) FROM events))`);
      for (const s of STAFF) {
        await client.query(
          'INSERT INTO staff (id, name, role, dept, status) VALUES ($1,$2,$3,$4,$5)',
          [s.id, s.name, s.role, s.dept, s.status],
        );
      }
      await client.query(
        `INSERT INTO change_log (who, action, module, detail) VALUES
         ('Grace Nakato', 'Signed in', 'Auth', 'Demo admin session'),
         ('Grace Nakato', 'Seeded school records', 'System', 'Pupils, applications and attendance'),
         ('B. Ssentongo', 'Opened report cards', 'Reports', 'Term 2 cards ready')`,
      );
      await client.query('COMMIT');
      this.log.log('Seeded Little Royals demo data');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  private async seedClockIfEmpty() {
    const row = await this.one<{ n: string }>('SELECT count(*)::text AS n FROM staff_clock');
    if (Number(row?.n) > 0) return;
    await this.query(
      `INSERT INTO staff_clock (email, who, role, clock_in, clock_out) VALUES
       ('teacher@littleroyals.ac.ug', 'B. Ssentongo', 'teacher',
         (date_trunc('day', now() AT TIME ZONE 'Africa/Kampala') - interval '1 day' + interval '7 hours 40 minutes') AT TIME ZONE 'Africa/Kampala',
         (date_trunc('day', now() AT TIME ZONE 'Africa/Kampala') - interval '1 day' + interval '16 hours 15 minutes') AT TIME ZONE 'Africa/Kampala')`,
    );
  }

  private async seedChangelogIfEmpty() {
    const row = await this.one<{ n: string }>('SELECT count(*)::text AS n FROM change_log');
    if (Number(row?.n) > 0) return;
    await this.query(
      `INSERT INTO change_log (who, action, module, detail) VALUES
       ('Grace Nakato', 'Signed in', 'Auth', 'Demo admin session'),
       ('Grace Nakato', 'Connected PostgreSQL', 'System', 'Indexed school records'),
       ('B. Ssentongo', 'Opened report cards', 'Reports', 'Term 2 cards ready')`,
    );
  }
}
