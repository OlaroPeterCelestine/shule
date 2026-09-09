import { Injectable, computed, inject } from '@angular/core';
import { MODULE_DEFS, type ModuleDef, type RecordRow } from './records.catalog';
import { SchoolOsStore } from './school-os.store';
import { StudentsStore } from './students.store';

@Injectable({ providedIn: 'root' })
export class RecordsStore {
  private os = inject(SchoolOsStore);
  private students = inject(StudentsStore);

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
