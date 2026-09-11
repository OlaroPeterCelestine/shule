import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { DbService } from '../db/db.service.js';
import { RbacService } from '../rbac/rbac.service.js';
import { SchoolStore } from '../store/school.store.js';

type Authed = { user?: { name?: string; email?: string; role?: string } };

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class SchoolController {
  constructor(
    private readonly store: SchoolStore,
    private readonly db: DbService,
    private readonly rbac: RbacService,
  ) {}

  @Get('changelog')
  changelog() {
    return this.db.changes();
  }

  @Get('school')
  school() {
    return this.store.school();
  }

  @Patch('school')
  async saveSchool(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.saveSchool(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Updated school profile', 'School', row.name);
    return row;
  }

  @Get('students')
  students() {
    return this.store.students();
  }

  @Get('students/:adm')
  student(@Param('adm') adm: string) {
    return this.store.student(adm);
  }

  @Post('students')
  async addStudent(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addStudent(body);
    if (!row) throw new Error('Could not enrol pupil');
    await this.db.logChange(req.user?.name || 'Staff', 'Enrolled pupil', 'Students', row.name + ' · ' + row.adm);
    return row;
  }

  @Get('admissions')
  admissions() {
    return this.store.applicants();
  }

  @Get('admissions/:id')
  applicant(@Param('id') id: string) {
    return this.store.applicant(id);
  }

  @Post('admissions')
  async addApplicant(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addApplicant(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Added application', 'Admissions', row.name + ' · ' + row.adm);
    return row;
  }

  @Patch('admissions/:id')
  async moveApplicant(
    @Param('id') id: string,
    @Body() body: { stage?: string; meta?: string; adm?: string },
    @Req() req: Authed,
  ) {
    const row = await this.store.moveApplicant(Number(id), body.stage ?? 'applied', body.meta ?? '');
    await this.db.logChange(req.user?.name || 'Staff', 'Moved application', 'Admissions', row.name + ' → ' + row.stage);
    return row;
  }

  @Get('attendance')
  attendance() {
    return this.store.register();
  }

  @Patch('attendance/:adm')
  async mark(@Param('adm') adm: string, @Body() body: { status?: string }, @Req() req: Authed) {
    const row = await this.store.setMark(adm, body.status ?? 'P');
    await this.db.logChange(req.user?.name || 'Staff', 'Marked attendance', 'Attendance', row.name + ' · ' + row.status);
    return row;
  }

  @Get('finance')
  finance() {
    return this.store.invoices();
  }

  @Get('finance/:id')
  invoice(@Param('id') id: string) {
    return this.store.invoice(id);
  }

  @Get('inventory')
  inventory() {
    return this.store.stock();
  }

  @Patch('inventory/:id')
  async issueStock(@Param('id') id: string, @Body() body: { qty?: number }, @Req() req: Authed) {
    const row = await this.store.issueStock(Number(id), Number(body.qty ?? 1));
    await this.db.logChange(req.user?.name || 'Staff', 'Issued stock', 'Inventory', row.name + ' · −' + Number(body.qty ?? 1));
    return row;
  }

  @Get('health')
  health() {
    return this.store.visits();
  }

  @Post('health')
  async addVisit(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addVisit(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Logged sickbay visit', 'Health', row.name + ' · ' + row.reason);
    return row;
  }

  @Get('calendar')
  calendar() {
    return this.store.events();
  }

  @Get('staff')
  staff() {
    return this.store.staff();
  }

  @Get('clock/me')
  myClock(@Req() req: Authed) {
    return this.store.myClock(req.user?.email || '');
  }

  @Get('clock/today')
  todayClock() {
    return this.store.todayClock();
  }

  @Post('clock/in')
  async clockIn(@Req() req: Authed) {
    const row = await this.store.clockIn(req.user?.email || '', req.user?.name || 'Staff', req.user?.role || 'teacher');
    await this.db.logChange(req.user?.name || 'Staff', 'Clocked in', 'Staff', row.inAt);
    return row;
  }

  @Post('clock/out')
  async clockOut(@Req() req: Authed) {
    const row = await this.store.clockOut(req.user?.email || '');
    await this.db.logChange(req.user?.name || 'Staff', 'Clocked out', 'Staff', row.outAt + (row.hours ? ' · ' + row.hours : ''));
    return row;
  }

  @Get('activities')
  activities() {
    return this.rbac.activities();
  }

  @Get('roles')
  roles() {
    return this.rbac.roles();
  }

  @Post('roles')
  async addRole(@Body() body: { label?: string; key?: string }, @Req() req: Authed) {
    const row = await this.rbac.createRole(body.label ?? '', body.key ?? '');
    await this.db.logChange(req.user?.name || 'Staff', 'Created role', 'Permissions', row.label);
    return row;
  }

  @Delete('roles/:key')
  async removeRole(@Param('key') key: string, @Req() req: Authed) {
    const res = await this.rbac.deleteRole(key);
    await this.db.logChange(req.user?.name || 'Staff', 'Deleted role', 'Permissions', key);
    return res;
  }

  @Get('perms')
  perms() {
    return this.rbac.perms();
  }

  @Patch('perms')
  async togglePerm(
    @Body() body: { role?: string; module?: string; can?: 'view' | 'create' | 'edit' | 'approve' },
    @Req() req: Authed,
  ) {
    const row = await this.rbac.toggle(body.role ?? '', body.module ?? '', body.can ?? 'view');
    await this.db.logChange(req.user?.name || 'Staff', 'Updated permission', 'Permissions', row.role + ' · ' + row.label + ' · ' + (body.can ?? 'view'));
    return row;
  }

  @Get('reports')
  reports() {
    return this.store.reports();
  }

  @Get('reports/cards')
  reportCards() {
    return this.store.reportCards();
  }
}
