import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { DbService } from '../db/db.service.js';
import { KafkaService } from '../kafka/kafka.service.js';
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
    private readonly kafka: KafkaService,
  ) {}

  private emit(type: string, detail: string, payload?: unknown) {
    void this.kafka.publish(type, { detail, payload });
  }

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
    this.emit('school.updated', row.name, row);
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
    this.emit('student.enrolled', row.name + ' · ' + row.adm, row);
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
    this.emit('admission.added', row.name + ' · ' + row.adm, row);
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
    this.emit('admission.moved', row.name + ' → ' + row.stage, row);
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
    this.emit('attendance.marked', row.name + ' · ' + row.status, row);
    return row;
  }

  @Post('attendance/bulk')
  async markBulk(@Body() body: { status?: string; cls?: string }, @Req() req: Authed) {
    const rows = await this.store.markRegister(body.status ?? 'P', body.cls);
    const who = body.cls || 'All classes';
    await this.db.logChange(req.user?.name || 'Staff', 'Marked attendance', 'Attendance', who + ' · ' + (body.status ?? 'P') + ' · ' + rows.length);
    this.emit('attendance.bulk', who + ' · ' + (body.status ?? 'P') + ' · ' + rows.length, { count: rows.length, cls: body.cls, status: body.status });
    return rows;
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

  @Post('inventory')
  async addStock(@Body() body: Record<string, string | number>, @Req() req: Authed) {
    const row = await this.store.addStock(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Stocked item', 'Inventory', row!.name + ' · ' + row!.qty);
    this.emit('inventory.added', row!.name, row);
    return row;
  }

  @Patch('inventory/:id')
  async issueStock(@Param('id') id: string, @Body() body: { qty?: number }, @Req() req: Authed) {
    const row = await this.store.issueStock(Number(id), Number(body.qty ?? 1));
    await this.db.logChange(req.user?.name || 'Staff', 'Issued stock', 'Inventory', row.name + ' · −' + Number(body.qty ?? 1));
    this.emit('inventory.issued', row.name + ' · −' + Number(body.qty ?? 1), row);
    return row;
  }

  @Get('health')
  health() {
    return this.store.visits();
  }

  @Post('health')
  async addVisit(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addVisit(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Logged sickbay visit', 'Health', row!.name + ' · ' + row!.reason);
    this.emit('health.visit', row!.name + ' · ' + row!.reason, row);
    return row;
  }

  @Patch('health/:id')
  async notifyVisit(@Param('id') id: string, @Req() req: Authed) {
    const row = await this.store.notifyVisit(Number(id));
    await this.db.logChange(req.user?.name || 'Staff', 'Notified parent', 'Health', row.name);
    this.emit('health.notified', row.name, row);
    return row;
  }

  @Get('calendar')
  calendar() {
    return this.store.events();
  }

  @Post('calendar')
  async addEvent(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addEvent(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Added calendar event', 'Calendar', row!.title);
    this.emit('calendar.added', row!.title, row);
    return row;
  }

  @Get('exams')
  exams() {
    return this.store.exams();
  }

  @Post('exams')
  async addExam(@Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.addExam(body);
    await this.db.logChange(req.user?.name || 'Staff', 'Scheduled exam', 'Academics', String(row.title));
    this.emit('exam.scheduled', String(row.title), row);
    return row;
  }

  @Post('exams/sitting')
  async addSitting(@Body() body: Record<string, string>, @Req() req: Authed) {
    const rows = await this.store.addSitting(body);
    await this.db.logChange(
      req.user?.name || 'Staff',
      'Created exam sitting',
      'Academics',
      (body.kind || 'End of term') + ' · ' + (body.cls || '') + ' · ' + rows.length + ' papers',
    );
    this.emit('exam.sitting', (body.kind || 'End of term') + ' · ' + rows.length + ' papers', { count: rows.length, cls: body.cls });
    return rows;
  }

  @Patch('exams/:id')
  async setExam(@Param('id') id: string, @Body() body: Record<string, string>, @Req() req: Authed) {
    const row = await this.store.setExam(Number(id), body);
    await this.db.logChange(req.user?.name || 'Staff', 'Updated exam', 'Academics', row.title + ' · ' + row.status);
    this.emit('exam.updated', row.title + ' · ' + row.status, row);
    return row;
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
