import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { SchoolStore } from '../store/school.store.js';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class SchoolController {
  constructor(private readonly store: SchoolStore) {}

  @Get('school')
  school() {
    return this.store.school;
  }

  @Patch('school')
  saveSchool(@Body() body: Record<string, string>) {
    return this.store.saveSchool(body);
  }

  @Get('students')
  students() {
    return this.store.students;
  }

  @Get('students/:adm')
  student(@Param('adm') adm: string) {
    return this.store.students.find((s) => s.adm === adm) ?? null;
  }

  @Post('students')
  addStudent(@Body() body: Record<string, string>) {
    return this.store.addStudent(body);
  }

  @Get('admissions')
  admissions() {
    return this.store.applicants;
  }

  @Get('admissions/:id')
  applicant(@Param('id') id: string) {
    return this.store.applicants.find((a) => String(a.id) === id) ?? null;
  }

  @Post('admissions')
  addApplicant(@Body() body: Record<string, string>) {
    return this.store.addApplicant(body);
  }

  @Patch('admissions/:id')
  moveApplicant(@Param('id') id: string, @Body() body: { stage?: string; meta?: string; adm?: string }) {
    return this.store.moveApplicant(Number(id), body.stage ?? 'applied', body.meta ?? '');
  }

  @Get('attendance')
  attendance() {
    return this.store.register;
  }

  @Patch('attendance/:adm')
  mark(@Param('adm') adm: string, @Body() body: { status?: string }) {
    return this.store.setMark(adm, body.status ?? 'P');
  }

  @Get('finance')
  finance() {
    return this.store.invoices;
  }

  @Get('finance/:id')
  invoice(@Param('id') id: string) {
    return this.store.invoices.find((i) => i.id === id) ?? null;
  }

  @Get('inventory')
  inventory() {
    return this.store.stock;
  }

  @Patch('inventory/:id')
  issueStock(@Param('id') id: string, @Body() body: { qty?: number }) {
    return this.store.issueStock(Number(id), Number(body.qty ?? 1));
  }

  @Get('health')
  health() {
    return this.store.visits;
  }

  @Post('health')
  addVisit(@Body() body: Record<string, string>) {
    return this.store.addVisit(body);
  }

  @Get('calendar')
  calendar() {
    return this.store.events;
  }

  @Get('staff')
  staff() {
    return this.store.staff;
  }

  @Get('perms')
  perms() {
    return this.store.perms;
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
