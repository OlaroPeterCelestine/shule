import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { cleanText } from '../util/form-safe.js';
import {
  ACTIVITIES,
  EXTRA_ROLES,
  SYSTEM_ROLES,
  activityForPath,
  defaultGrant,
  isRoleKey,
  roleKey,
} from './activities.js';

const WRITE = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class RbacService {
  constructor(private readonly db: DbService) {}

  activities() {
    return ACTIVITIES;
  }

  async ensure() {
    for (const role of [...SYSTEM_ROLES, ...EXTRA_ROLES]) {
      await this.db.query(
        `INSERT INTO roles (key, label, locked) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, locked = roles.locked OR EXCLUDED.locked`,
        [role.key, role.label, role.locked],
      );
    }
    const sample = await this.db.one<{ module: string }>('SELECT module FROM perms LIMIT 1');
    const known = new Set(ACTIVITIES.map((a) => a.key));
    if (sample && !known.has(sample.module)) {
      await this.db.query('DELETE FROM perms');
    }
    const roles = await this.db.query<{ key: string }>('SELECT key FROM roles');
    for (const role of roles) {
      for (const activity of ACTIVITIES) {
        const grant = defaultGrant(role.key, activity.key);
        await this.db.query(
          `INSERT INTO perms (role, module, can_view, can_create, can_edit, can_approve)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (role, module) DO NOTHING`,
          [role.key, activity.key, grant.view, grant.create, grant.edit, grant.approve],
        );
      }
    }
    await this.db.query(
      `UPDATE perms SET can_view = true, can_create = true, can_edit = true
       WHERE role = 'teacher' AND module = 'academics'`,
    );
    await this.db.query(
      `UPDATE perms SET can_view = true, can_create = true, can_edit = true
       WHERE role = 'teacher' AND module = 'inventory'`,
    );
    await this.db.query(
      `UPDATE perms SET can_view = true WHERE role = 'accountant' AND module = 'inventory'`,
    );
  }

  async roles() {
    return this.db.query<{ key: string; label: string; locked: boolean; users: string }>(
      `SELECT r.key, r.label, r.locked, (SELECT count(*)::text FROM users u WHERE u.role = r.key) AS users
       FROM roles r ORDER BY r.locked DESC, r.label`,
    ).then((rows) => rows.map((r) => ({ ...r, users: Number(r.users), locked: !!r.locked })));
  }

  async perms() {
    const rows = await this.db.query(
      `SELECT p.role, p.module, p.can_view, p.can_create, p.can_edit, p.can_approve, r.label AS role_label
       FROM perms p LEFT JOIN roles r ON r.key = p.role
       ORDER BY r.locked DESC, p.role, p.module`,
    );
    const labels = Object.fromEntries(ACTIVITIES.map((a) => [a.key, a.label]));
    return rows.map((p) => ({
      role: p.role,
      roleLabel: p.role_label || p.role,
      module: p.module,
      label: labels[String(p.module)] || p.module,
      view: !!p.can_view,
      create: !!p.can_create,
      edit: !!p.can_edit,
      approve: !!p.can_approve,
    }));
  }

  async forRole(role: string) {
    if (role === 'admin') {
      return ACTIVITIES.map((a) => ({
        role: 'admin',
        roleLabel: 'Admin',
        module: a.key,
        label: a.label,
        view: true,
        create: true,
        edit: true,
        approve: true,
      }));
    }
    return (await this.perms()).filter((p) => p.role === role);
  }

  async createRole(label: string, requested = '') {
    const name = cleanText(label, 40);
    if (!name) throw new BadRequestException('Role name is required');
    const key = isRoleKey(requested) ? requested : roleKey(name);
    if (!isRoleKey(key)) throw new BadRequestException('Role key must start with a letter');
    if (key === 'admin') throw new BadRequestException('Admin already exists');
    const taken = await this.db.one('SELECT 1 AS x FROM roles WHERE key = $1', [key]);
    if (taken) throw new BadRequestException('That role already exists');
    await this.db.query('INSERT INTO roles (key, label, locked) VALUES ($1, $2, false)', [key, name]);
    for (const activity of ACTIVITIES) {
      const grant = defaultGrant(key, activity.key);
      await this.db.query(
        `INSERT INTO perms (role, module, can_view, can_create, can_edit, can_approve)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [key, activity.key, grant.view, grant.create, grant.edit, grant.approve],
      );
    }
    return { key, label: name, locked: false, users: 0 };
  }

  async deleteRole(key: string) {
    const role = await this.db.one<{ locked: boolean; users: string }>(
      `SELECT locked, (SELECT count(*)::text FROM users u WHERE u.role = $1) AS users FROM roles WHERE key = $1`,
      [key],
    );
    if (!role) throw new NotFoundException('Role not found');
    if (role.locked) throw new BadRequestException('System roles cannot be deleted');
    if (Number(role.users) > 0) throw new BadRequestException('Reassign staff before deleting this role');
    await this.db.query('DELETE FROM perms WHERE role = $1', [key]);
    await this.db.query('DELETE FROM roles WHERE key = $1', [key]);
    return { ok: true };
  }

  async toggle(role: string, module: string, can: 'view' | 'create' | 'edit' | 'approve') {
    if (role === 'admin') throw new BadRequestException('Admin always has full access');
    if (!ACTIVITIES.some((a) => a.key === module)) throw new BadRequestException('Unknown activity');
    const exists = await this.db.one('SELECT 1 AS x FROM roles WHERE key = $1', [role]);
    if (!exists) throw new NotFoundException('Role not found');
    const col = { view: 'can_view', create: 'can_create', edit: 'can_edit', approve: 'can_approve' }[can];
    await this.db.query(
      `INSERT INTO perms (role, module, can_view, can_create, can_edit, can_approve)
       VALUES ($1, $2, false, false, false, false)
       ON CONFLICT (role, module) DO NOTHING`,
      [role, module],
    );
    const row = await this.db.one(
      `UPDATE perms SET ${col} = NOT ${col} WHERE role = $1 AND module = $2
       RETURNING role, module, can_view, can_create, can_edit, can_approve`,
      [role, module],
    );
    if (!row) throw new NotFoundException('Permission row missing');
    if ((row.can_create || row.can_edit || row.can_approve) && !row.can_view) {
      await this.db.query('UPDATE perms SET can_view = true WHERE role = $1 AND module = $2', [role, module]);
      row.can_view = true;
    }
    if (!row.can_view) {
      await this.db.query(
        'UPDATE perms SET can_create = false, can_edit = false, can_approve = false WHERE role = $1 AND module = $2',
        [role, module],
      );
      row.can_create = false;
      row.can_edit = false;
      row.can_approve = false;
    }
    const labels = Object.fromEntries(ACTIVITIES.map((a) => [a.key, a.label]));
    return {
      role: row.role,
      module: row.module,
      label: labels[String(row.module)] || row.module,
      view: !!row.can_view,
      create: !!row.can_create,
      edit: !!row.can_edit,
      approve: !!row.can_approve,
    };
  }

  async canWrite(role: string | undefined, path: string, method: string) {
    if (!WRITE.has(method)) return true;
    if (!role) return false;
    if (role === 'admin') return true;
    const activity = activityForPath(path);
    if (!activity) return false;
    if (activity.key === 'system') return false;
    const row = await this.db.one<{ can_create: boolean; can_edit: boolean; can_approve: boolean }>(
      'SELECT can_create, can_edit, can_approve FROM perms WHERE role = $1 AND module = $2',
      [role, activity.key],
    );
    if (!row) return false;
    if (method === 'POST') return !!row.can_create;
    return !!row.can_edit || !!row.can_approve;
  }
}
