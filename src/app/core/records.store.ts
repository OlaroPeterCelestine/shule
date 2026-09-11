import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MODULE_DEFS, type ModuleDef, type RecordRow } from './records.catalog';
import { SchoolOsStore } from './school-os.store';
import { StudentsStore } from './students.store';

@Injectable({ providedIn: 'root' })
export class RecordsStore {
  private os = inject(SchoolOsStore);
  private students = inject(StudentsStore);
  private auth = inject(AuthService);

  readonly live = computed(() => ({
    students: this.studentRows(),
    admissions: this.applicantRows(),
    attendance: this.attendanceRows(),
    inventory: this.stockRows(),
    health: this.healthRows(),
    calendar: this.eventRows(),
    website: this.cmsRows(),
    academics: this.examRows(),
    assessments: this.questionRows(),
    school: this.schoolRows(),
    finance: this.financeRows(),
    dashboard: this.dashboardRows(),
    reports: this.reportRows(),
    system: this.systemRows(),
  }));

  def(key: string): ModuleDef {
    return MODULE_DEFS[key] ?? MODULE_DEFS['dashboard'];
  }

  rows(key: string): RecordRow[] {
    const live = this.live()[key as keyof ReturnType<RecordsStore['live']>];
    if (live) return live;
    return this.def(key).rows;
  }

  find(key: string, id: string): RecordRow | undefined {
    return this.rows(key).find((r) => r.id === id);
  }

  private studentRows(): RecordRow[] {
    return this.students.students().map((s) => ({
      id: s.adm,
      title: s.name,
      subtitle: s.cls,
      status: s.feeLabel,
      cells: {
        adm: s.adm,
        name: s.name,
        cls: s.cls,
        guardian: s.guardian,
        attendance: s.attendance,
        fees: s.feeLabel,
        gender: s.gender ?? '—',
        dob: s.dob ?? '—',
        phone: s.guardianPhone ?? '—',
        address: s.address ?? '—',
      },
      notes: s.notes,
    }));
  }

  private applicantRows(): RecordRow[] {
    return this.os.applicants().map((a) => ({
      id: String(a.id),
      title: a.name,
      subtitle: a.cls,
      status: a.stage,
      cells: {
        adm: a.adm || '—',
        name: a.name,
        cls: a.cls,
        stage: a.stage,
        meta: a.meta,
        lin: a.lin || '—',
        father: a.fatherName || '—',
        mother: a.motherName || '—',
        schoolpay: a.schoolpay || '—',
        transport: a.transport || '—',
      },
    }));
  }

  private attendanceRows(): RecordRow[] {
    const label: Record<string, string> = { P: 'Present', A: 'Absent', L: 'Late', E: 'Excused' };
    return this.os.register().map((r) => ({
      id: r.adm,
      title: r.name,
      subtitle: r.cls,
      status: label[r.status] ?? r.status,
      cells: { adm: r.adm, name: r.name, cls: r.cls, status: label[r.status] ?? r.status },
    }));
  }

  private stockRows(): RecordRow[] {
    return this.os.stock().map((i) => ({
      id: String(i.id),
      title: i.name,
      subtitle: i.category,
      status: i.qty < 20 ? 'Low' : 'In stock',
      cells: { name: i.name, category: i.category, qty: String(i.qty), location: i.location },
    }));
  }

  private healthRows(): RecordRow[] {
    return this.os.visits().map((v) => ({
      id: String(v.id),
      title: v.name,
      subtitle: v.reason,
      status: v.notified ? 'Notified' : 'Pending',
      cells: {
        name: v.name,
        reason: v.reason,
        action: v.action,
        time: v.time,
        notified: v.notified ? 'Yes' : 'No',
        adm: v.adm,
      },
    }));
  }

  private eventRows(): RecordRow[] {
    return this.os.events().map((e) => ({
      id: String(e.id),
      title: e.title,
      subtitle: e.date,
      status: e.type,
      cells: { title: e.title, date: e.date, type: e.type, audience: e.audience },
    }));
  }

  private cmsRows(): RecordRow[] {
    return this.os.cms().map((p) => ({
      id: String(p.id),
      title: p.title,
      subtitle: p.updated,
      status: p.status,
      cells: { title: p.title, status: p.status, updated: p.updated },
    }));
  }

  private examRows(): RecordRow[] {
    return this.os.examRooms().map((e) => ({
      id: String(e.id),
      title: e.exam,
      subtitle: e.room,
      status: `${e.seated}/${e.capacity}`,
      cells: {
        room: e.room,
        exam: e.exam,
        capacity: String(e.capacity),
        seated: String(e.seated),
        invigilator: e.invigilator,
      },
    }));
  }

  private questionRows(): RecordRow[] {
    return this.os.questions().map((q) => ({
      id: String(q.id),
      title: q.topic,
      subtitle: q.subject,
      status: q.difficulty,
      cells: {
        subject: q.subject,
        topic: q.topic,
        type: q.type,
        difficulty: q.difficulty,
        marks: String(q.marks),
        text: q.text,
      },
    }));
  }

  private financeRows(): RecordRow[] {
    return this.students.students().map((s) => ({
      id: s.adm,
      title: s.name,
      subtitle: s.cls,
      status: s.fee === 'cleared' ? 'Cleared' : 'Due',
      cells: {
        ref: s.adm,
        name: s.name,
        total: s.feeLabel,
        paid: s.fee === 'cleared' ? s.feeLabel : '—',
        balance: s.fee === 'due' ? s.feeLabel : '0',
        status: s.fee === 'cleared' ? 'Cleared' : 'Due',
        due: s.fee === 'due' ? 'This term' : '—',
      },
    }));
  }

  private dashboardRows(): RecordRow[] {
    const due = this.students.students().filter((s) => s.fee === 'due');
    const absent = this.os.register().filter((r) => r.status === 'A');
    const pending = this.os.applicants().filter((a) => a.stage === 'applied' || a.stage === 'review' || a.stage === 'interview');
    const sick = this.os.visits().filter((v) => !v.notified);
    const rows: RecordRow[] = [];
    if (due.length) {
      rows.push({
        id: 'act-fees',
        title: 'Fee balances due',
        subtitle: due.length + ' families',
        status: 'Urgent',
        href: '/finance/report',
        cells: { area: 'Finance', item: due.length + ' balances due', owner: 'Accounts', when: 'Today', status: 'Urgent', impact: 'Follow up from the fees report' },
      });
    }
    if (absent.length) {
      rows.push({
        id: 'act-abs',
        title: 'Absent students',
        subtitle: absent.map((r) => r.name).join(', '),
        status: 'Open',
        href: '/attendance/report',
        cells: { area: 'Attendance', item: absent.map((r) => r.name).join(', '), owner: 'Class teacher', when: 'Morning', status: 'Open', impact: 'SMS parent if not in' },
      });
    }
    if (pending.length) {
      rows.push({
        id: 'act-adm',
        title: 'Applications in pipeline',
        subtitle: pending.length + ' open',
        status: 'Review',
        href: '/admissions/report',
        cells: { area: 'Admissions', item: pending.length + ' applications to move', owner: 'Registrar', when: 'Today', status: 'Review', impact: 'Open the admissions report' },
      });
    }
    if (sick.length) {
      rows.push({
        id: 'act-health',
        title: 'Sickbay follow-up',
        subtitle: sick[0].name,
        status: 'Pending',
        href: '/health/report',
        cells: { area: 'Health', item: sick[0].name + ' — ' + sick[0].reason, owner: 'Nurse', when: sick[0].time, status: 'Pending', impact: 'Notify parent' },
      });
    }
    rows.push({
      id: 'act-cards',
      title: 'Report cards ready',
      subtitle: this.students.students().length + ' pupils',
      status: 'Ready',
      href: '/reports',
      cells: { area: 'Reports', item: this.students.students().length + ' term cards', owner: 'Academics', when: 'Term 2', status: 'Ready', impact: 'Print or download CSV' },
    });
    return rows;
  }

  private reportRows(): RecordRow[] {
    const pupils = this.students.students().length;
    const due = this.students.students().filter((s) => s.fee === 'due').length;
    const marked = this.os.register().length;
    const apps = this.os.applicants().length;
    const year = this.os.school().year || '2026';
    const term = this.os.school().term || 'Term 2';
    return [
      { id: 'rpt-cards', title: 'Term report cards', subtitle: 'All pupils', status: pupils + ' ready', href: '/reports', cells: { name: 'Term report cards', audience: 'All pupils', period: term + ', ' + year, status: pupils + ' ready', owner: 'Academics' } },
      { id: 'rpt-enr', title: 'Enrolment census', subtitle: 'Registrar', status: String(pupils), href: '/students/report', cells: { name: 'Enrolment census', audience: 'Registrar', period: term, status: pupils + ' on roll', owner: 'Admin' } },
      { id: 'rpt-adm', title: 'Admissions pipeline', subtitle: 'Applications', status: String(apps), href: '/admissions/report', cells: { name: 'Admissions pipeline', audience: 'Registrar', period: term, status: apps + ' applications', owner: 'Admin' } },
      { id: 'rpt-fees', title: 'Fee collection summary', subtitle: 'Accounts', status: due + ' due', href: '/finance/report', cells: { name: 'Fee collection summary', audience: 'Accounts + Board', period: term, status: due + ' due', owner: 'Accountant' } },
      { id: 'rpt-att', title: 'Daily attendance', subtitle: 'Heads of class', status: String(marked), href: '/attendance/report', cells: { name: 'Daily attendance', audience: 'Heads of class', period: 'Today', status: marked + ' marked', owner: 'Admin' } },
      { id: 'rpt-sys', title: 'System & audit', subtitle: 'Permissions', status: 'Live', href: '/system/report', cells: { name: 'System & audit', audience: 'Admin', period: term, status: 'Live', owner: this.auth.user()?.name || 'Admin' } },
    ];
  }

  private systemRows(): RecordRow[] {
    const who = this.auth.user()?.name || 'Admin';
    const pupils = this.students.students().length;
    const apps = this.os.applicants().length;
    const due = this.students.students().filter((s) => s.fee === 'due').length;
    const perms = this.os.perms().length;
    return [
      { id: 'au-auth', title: who + ' signed in', subtitle: 'Auth', status: 'OK', cells: { who, action: 'Signed in', module: 'Auth', when: 'This session', status: 'OK' } },
      { id: 'au-stu', title: pupils + ' pupils on roll', subtitle: 'Students', status: 'OK', cells: { who, action: pupils + ' pupils on roll', module: 'Students', when: 'Live', status: 'OK' } },
      { id: 'au-adm', title: apps + ' applications on file', subtitle: 'Admissions', status: 'OK', cells: { who, action: apps + ' applications on file', module: 'Admissions', when: 'Live', status: 'OK' } },
      { id: 'au-fee', title: due + ' fee balances due', subtitle: 'Finance', status: due ? 'Review' : 'OK', cells: { who, action: due + ' fee balances due', module: 'Finance', when: 'Live', status: due ? 'Review' : 'OK' } },
      { id: 'au-rbac', title: perms + ' permission rows', subtitle: 'RBAC', status: 'OK', cells: { who, action: perms + ' permission rows', module: 'RBAC', when: 'Live', status: 'OK' } },
    ];
  }

  private schoolRows(): RecordRow[] {
    const campuses = this.os.campuses().map((c) => ({
      id: String(c.id),
      title: c.name,
      subtitle: c.city,
      status: 'Campus',
      cells: { name: c.name, city: c.city, focus: c.focus, status: 'Open', contact: this.os.school().phone },
    }));
    const houses = this.os.houses().map((h) => ({
      id: 'house-' + h.id,
      title: h.name + ' house',
      subtitle: h.colour,
      status: h.members + ' members',
      cells: { name: h.name, city: 'Seguku', focus: 'House — ' + h.colour, status: h.members + ' members', contact: 'House tutor' },
    }));
    return [...campuses, ...houses];
  }
}
