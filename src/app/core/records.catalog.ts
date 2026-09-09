export interface ColDef {
  key: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
}

export interface RecordRow {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  cells: Record<string, string>;
  notes?: string;
}

export interface ModuleDef {
  key: string;
  title: string;
  singular: string;
  subtitle: string;
  columns: ColDef[];
  fields: FieldDef[];
  rows: RecordRow[];
}

function r(id: string, title: string, status: string, cells: Record<string, string>, notes?: string): RecordRow {
  const first = Object.values(cells)[0] ?? '';
  return { id, title, subtitle: first, status, cells, notes };
}

function cols(...pairs: [string, string][]): ColDef[] {
  return pairs.map(([key, label]) => ({ key, label }));
}

function fields(...pairs: [string, string][]): FieldDef[] {
  return pairs.map(([key, label]) => ({ key, label }));
}

export const MODULE_DEFS: Record<string, ModuleDef> = {
  dashboard: {
    key: 'dashboard',
    title: 'Dashboard',
    singular: 'Activity',
    subtitle: 'Live school activity that needs a follow-up today',
    columns: cols(['area', 'Area'], ['item', 'Item'], ['owner', 'Owner'], ['when', 'When'], ['status', 'Status']),
    fields: fields(['area', 'Area'], ['item', 'Item'], ['owner', 'Owner'], ['when', 'When'], ['status', 'Status'], ['impact', 'Impact']),
    rows: [
      r('act-1', 'Fee balances due', 'Urgent', { area: 'Finance', item: '3 families over UGX 500k', owner: 'B. Kato', when: 'Today', status: 'Urgent', impact: 'Call list for accounts' }),
      r('act-2', 'Absent students', 'Open', { area: 'Attendance', item: 'Okello Derrick — Primary Three', owner: 'B. Ssentongo', when: 'Morning', status: 'Open', impact: 'SMS parent if not in by 10am' }),
      r('act-3', 'Leave requests', 'Review', { area: 'HR', item: '2 pending approvals', owner: 'Grace Nakato', when: '12 min ago', status: 'Review', impact: 'Driver coverage on Route 1' }),
      r('act-4', 'Interview slots', 'Scheduled', { area: 'Admissions', item: 'Namuli Grace — 11 Sep, 10am', owner: 'Registrar', when: 'Tomorrow', status: 'Scheduled', impact: 'Prepare paper form pack' }),
      r('act-5', 'Sickbay visit', 'Notified', { area: 'Health', item: 'Achieng Patricia — inhaler', owner: 'Nurse', when: '9:40am', status: 'Notified', impact: 'Parent already called' }),
    ],
  },
  school: {
    key: 'school',
    title: 'School setup',
    singular: 'Campus',
    subtitle: 'Campuses, houses and the official school profile',
    columns: cols(['name', 'Name'], ['city', 'City'], ['focus', 'Focus'], ['status', 'Status']),
    fields: fields(['name', 'Name'], ['city', 'City'], ['focus', 'Focus'], ['status', 'Status'], ['contact', 'Contact']),
    rows: [
      r('1', 'Main campus — Seguku', 'Open', { name: 'Main campus — Seguku', city: 'Kampala', focus: 'Kindergarten & Primary', status: 'Open', contact: '0772 435 539' }),
      r('2', 'Day van routes', 'Active', { name: 'Day van routes', city: 'Greater Kampala', focus: 'Pick & drop', status: 'Active', contact: '0704 626 670' }),
      r('eagle', 'Eagle house', '312 members', { name: 'Eagle', city: 'Seguku', focus: 'House — Gold', status: '312 members', contact: 'House tutor' }),
      r('lion', 'Lion house', '298 members', { name: 'Lion', city: 'Seguku', focus: 'House — Maroon', status: '298 members', contact: 'House tutor' }),
    ],
  },
  students: {
    key: 'students',
    title: 'Students',
    singular: 'Student',
    subtitle: 'Enrolment register for Little Royals',
    columns: cols(['adm', 'Adm. No.'], ['name', 'Name'], ['cls', 'Class'], ['guardian', 'Guardian'], ['attendance', 'Attendance'], ['fees', 'Fees']),
    fields: fields(['adm', 'Admission no.'], ['name', 'Name'], ['cls', 'Class'], ['guardian', 'Guardian'], ['attendance', 'Attendance'], ['fees', 'Fees']),
    rows: [],
  },
  admissions: {
    key: 'admissions',
    title: 'Admissions',
    singular: 'Applicant',
    subtitle: 'Paper applications moving through the pipeline',
    columns: cols(['name', 'Name'], ['cls', 'Class'], ['stage', 'Stage'], ['meta', 'Notes']),
    fields: fields(['name', 'Name'], ['cls', 'Class'], ['stage', 'Stage'], ['meta', 'Notes']),
    rows: [],
  },
  finance: {
    key: 'finance',
    title: 'Fees & Payroll',
    singular: 'Invoice',
    subtitle: 'Invoices, balances and payroll lines for Term 2',
    columns: cols(['ref', 'Ref'], ['name', 'Name'], ['total', 'Total'], ['paid', 'Paid'], ['balance', 'Balance'], ['status', 'Status']),
    fields: fields(['ref', 'Reference'], ['name', 'Name'], ['total', 'Total (UGX)'], ['paid', 'Paid (UGX)'], ['balance', 'Balance (UGX)'], ['status', 'Status'], ['due', 'Due date']),
    rows: [
      r('INV-4471', 'Nakiwala Faith', 'Cleared', { ref: 'INV-4471', name: 'Nakiwala Faith', total: '1,020,000', paid: '1,020,000', balance: '0', status: 'Cleared', due: '—' }, 'Term 2 tuition fully paid via Schoolpay.'),
      r('INV-4472', 'Namutebi Racheal', 'Overdue', { ref: 'INV-4472', name: 'Namutebi Racheal', total: '980,000', paid: '360,000', balance: '620,000', status: 'Overdue', due: '1 Sep 2026' }, 'Boarding + tuition. Reminder SMS sent.'),
      r('INV-4473', 'Okello Derrick', 'Due', { ref: 'INV-4473', name: 'Okello Derrick', total: '860,000', paid: '320,000', balance: '540,000', status: 'Due', due: '20 Sep 2026' }),
      r('INV-4474', 'Achieng Patricia', 'Due', { ref: 'INV-4474', name: 'Achieng Patricia', total: '720,000', paid: '240,000', balance: '480,000', status: 'Due', due: '20 Sep 2026' }),
      r('PAY-091', 'Ssentongo B.', 'Payroll', { ref: 'PAY-091', name: 'Ssentongo B.', total: '2,000,000', paid: '1,688,000', balance: '0', status: 'Payroll', due: '30 Sep 2026' }, 'Net after NSSF and PAYE.'),
    ],
  },
  reports: {
    key: 'reports',
    title: 'Reports & Analytics',
    singular: 'Report',
    subtitle: 'Saved and scheduled school reports',
    columns: cols(['name', 'Report'], ['audience', 'Audience'], ['period', 'Period'], ['status', 'Status']),
    fields: fields(['name', 'Report'], ['audience', 'Audience'], ['period', 'Period'], ['status', 'Status'], ['owner', 'Owner']),
    rows: [
      r('rpt-cards', 'Term 2 report cards', 'Ready', { name: 'Term 2 report cards', audience: 'All pupils', period: 'Term 2, 2026', status: 'Ready', owner: 'B. Ssentongo' }),
      r('rpt-fees', 'Fee collection summary', 'Published', { name: 'Fee collection summary', audience: 'Accounts + Board', period: 'Week 8', status: 'Published', owner: 'B. Kato' }),
      r('rpt-att', 'Weekly attendance', 'Published', { name: 'Weekly attendance', audience: 'Heads of class', period: '2–6 Sep', status: 'Published', owner: 'Admin' }),
      r('rpt-enr', 'Enrolment census', 'Draft', { name: 'Enrolment census', audience: 'Registrar', period: 'Term 2', status: 'Draft', owner: 'Grace Nakato' }),
    ],
  },
  comms: {
    key: 'comms',
    title: 'Communication',
    singular: 'Campaign',
    subtitle: 'SMS, email and push campaigns',
    columns: cols(['title', 'Campaign'], ['channel', 'Channel'], ['audience', 'Audience'], ['delivered', 'Delivered'], ['status', 'Status']),
    fields: fields(['title', 'Campaign'], ['channel', 'Channel'], ['audience', 'Audience'], ['delivered', 'Delivered'], ['status', 'Status'], ['sent', 'Sent at']),
    rows: [
      r('c1', 'Fee reminder — Primary Seven', 'Sent', { title: 'Fee reminder — Primary Seven', channel: 'SMS', audience: 'P7 parents', delivered: '56 / 58', status: 'Sent', sent: '8 Sep, 7:40am' }),
      r('c2', 'Mid-term reports released', 'Sent', { title: 'Mid-term reports released', channel: 'Email', audience: '1,284 parents', delivered: '1,271 / 1,284', status: 'Sent', sent: '5 Sep, 4:10pm' }),
      r('c3', 'Sports day — transport update', 'Sent', { title: 'Sports day — transport update', channel: 'Push', audience: '312 van parents', delivered: '308 / 312', status: 'Sent', sent: '3 Sep, 6:00pm' }),
      r('c4', 'Parents’ day invitation', 'Draft', { title: 'Parents’ day invitation', channel: 'SMS + Email', audience: 'All parents', delivered: '—', status: 'Draft', sent: 'Not yet' }),
    ],
  },
  hr: {
    key: 'hr',
    title: 'Staff & HR',
    singular: 'Staff member',
    subtitle: 'Directory, contracts and leave',
    columns: cols(['name', 'Name'], ['role', 'Role'], ['dept', 'Department'], ['status', 'Status']),
    fields: fields(['name', 'Name'], ['role', 'Role'], ['dept', 'Department'], ['status', 'Status'], ['phone', 'Phone'], ['staffId', 'Staff ID']),
    rows: [
      r('st-1', 'Grace Nakato', 'Active', { name: 'Grace Nakato', role: 'Headteacher', dept: 'Administration', status: 'Active', phone: '0772 435 539', staffId: 'LR-ST-001' }),
      r('st-2', 'B. Ssentongo', 'Active', { name: 'B. Ssentongo', role: 'Teacher — Mathematics', dept: 'Academics', status: 'Active', phone: '0704 626 670', staffId: 'LR-ST-014' }),
      r('st-3', 'B. Kato', 'Active', { name: 'B. Kato', role: 'Accountant', dept: 'Finance', status: 'Active', phone: '0754 301 175', staffId: 'LR-ST-008' }),
      r('st-4', 'Mugabe S.', 'On leave', { name: 'Mugabe S.', role: 'Driver — Route 1', dept: 'Transport', status: 'On leave', phone: '0772 110 220', staffId: 'LR-ST-041' }, 'Sick leave 8–12 Sep.'),
      r('st-5', 'Namutebi J.', 'Leave pending', { name: 'Namutebi J.', role: 'Teacher — English', dept: 'Academics', status: 'Leave pending', phone: '0752 441 009', staffId: 'LR-ST-019' }, 'Annual leave 20–27 Sep.'),
    ],
  },
  curriculum: {
    key: 'curriculum',
    title: 'Curriculum',
    singular: 'Subject plan',
    subtitle: 'Syllabus coverage against the term plan',
    columns: cols(['subject', 'Subject'], ['cls', 'Class'], ['covered', 'Covered'], ['expected', 'Expected'], ['status', 'Status']),
    fields: fields(['subject', 'Subject'], ['cls', 'Class'], ['covered', 'Covered'], ['expected', 'Expected'], ['status', 'Status'], ['teacher', 'Teacher']),
    rows: [
      r('cur-math-p5', 'Mathematics — Primary Five', 'Behind', { subject: 'Mathematics', cls: 'Primary Five', covered: '72%', expected: '80%', status: 'Behind', teacher: 'B. Ssentongo' }, '8 points behind schedule.'),
      r('cur-sci-p7', 'Science — Primary Seven', 'On track', { subject: 'Science', cls: 'Primary Seven', covered: '88%', expected: '85%', status: 'On track', teacher: 'J. Namutebi' }),
      r('cur-eng-p1', 'English — Primary One', 'On track', { subject: 'English', cls: 'Primary One', covered: '64%', expected: '65%', status: 'On track', teacher: 'Namutebi J.' }),
      r('cur-lit-p3', 'Literacy — Primary Three', 'Ahead', { subject: 'Literacy', cls: 'Primary Three', covered: '78%', expected: '70%', status: 'Ahead', teacher: 'S. Achieng' }),
    ],
  },
  academics: {
    key: 'academics',
    title: 'Timetable & Exams',
    singular: 'Exam room',
    subtitle: 'Exam rooms, invigilation and clashes',
    columns: cols(['room', 'Room'], ['exam', 'Exam'], ['capacity', 'Capacity'], ['seated', 'Seated'], ['invigilator', 'Invigilator']),
    fields: fields(['room', 'Room'], ['exam', 'Exam'], ['capacity', 'Capacity'], ['seated', 'Seated'], ['invigilator', 'Invigilator']),
    rows: [],
  },
  assessments: {
    key: 'assessments',
    title: 'Assessments',
    singular: 'Question',
    subtitle: 'Question bank and continuous assessment',
    columns: cols(['subject', 'Subject'], ['topic', 'Topic'], ['type', 'Type'], ['difficulty', 'Difficulty'], ['marks', 'Marks']),
    fields: fields(['subject', 'Subject'], ['topic', 'Topic'], ['type', 'Type'], ['difficulty', 'Difficulty'], ['marks', 'Marks'], ['text', 'Question']),
    rows: [],
  },
  attendance: {
    key: 'attendance',
    title: 'Attendance',
    singular: 'Register row',
    subtitle: 'Today’s roll call',
    columns: cols(['adm', 'Adm.'], ['name', 'Student'], ['cls', 'Class'], ['status', 'Mark']),
    fields: fields(['adm', 'Admission no.'], ['name', 'Student'], ['cls', 'Class'], ['status', 'Mark']),
    rows: [],
  },
  transport: {
    key: 'transport',
    title: 'Transport',
    singular: 'Route',
    subtitle: 'Van routes, vehicles and assigned students',
    columns: cols(['route', 'Route'], ['vehicle', 'Vehicle'], ['driver', 'Driver'], ['students', 'Students'], ['status', 'Status']),
    fields: fields(['route', 'Route'], ['vehicle', 'Vehicle'], ['driver', 'Driver'], ['students', 'Students'], ['status', 'Status'], ['next', 'Next action']),
    rows: [
      r('r1', 'Route 1 — Ntinda', 'Driver on leave', { route: 'Route 1 — Ntinda', vehicle: 'UBH 221K', driver: 'Mugabe S.', students: '54', status: 'Driver on leave', next: 'Service due 15 Sep' }),
      r('r2', 'Route 2 — Kireka', 'On schedule', { route: 'Route 2 — Kireka', vehicle: 'UBH 340L', driver: 'Kalema P.', students: '48', status: 'On schedule', next: 'Serviced 2 Sep' }),
      r('r3', 'Route 3 — Bweyogerere', 'On schedule', { route: 'Route 3 — Bweyogerere', vehicle: 'UBH 118M', driver: 'Wasswa T.', students: '61', status: 'On schedule', next: 'Serviced 28 Aug' }),
      r('r4', 'Route 4 — Namugongo', 'Inspection', { route: 'Route 4 — Namugongo', vehicle: 'UBH 502N', driver: 'Achen R.', students: '57', status: 'Inspection today', next: 'Inspection 9 Sep' }),
    ],
  },
  library: {
    key: 'library',
    title: 'Library',
    singular: 'Loan',
    subtitle: 'Loans and the asset register',
    columns: cols(['item', 'Item'], ['holder', 'Holder'], ['due', 'Due'], ['status', 'Status']),
    fields: fields(['item', 'Item'], ['holder', 'Holder'], ['due', 'Due'], ['status', 'Status'], ['isbn', 'Code']),
    rows: [
      r('lib-1', 'Things Fall Apart', 'Out', { item: 'Things Fall Apart', holder: 'Nakiwala Faith', due: '16 Sep', status: 'Out', isbn: 'LIB-1102' }),
      r('lib-2', 'MK Primary Mathematics 3', 'Overdue', { item: 'MK Primary Mathematics 3', holder: 'Okello Derrick', due: '4 Sep', status: 'Overdue', isbn: 'LIB-2240' }),
      r('lib-3', 'Oxford Primary Atlas', 'In', { item: 'Oxford Primary Atlas', holder: 'Shelf B2', due: '—', status: 'In', isbn: 'LIB-0088' }),
      r('lib-4', 'Chromebook set #6', 'Out', { item: 'Chromebook set #6', holder: 'Primary Five', due: '11 Sep', status: 'Out', isbn: 'AST-006' }),
    ],
  },
  inventory: {
    key: 'inventory',
    title: 'Inventory',
    singular: 'Stock item',
    subtitle: 'Stores, issues and low-stock alerts',
    columns: cols(['name', 'Item'], ['category', 'Category'], ['qty', 'Qty'], ['location', 'Location']),
    fields: fields(['name', 'Item'], ['category', 'Category'], ['qty', 'Qty'], ['location', 'Location']),
    rows: [],
  },
  hostel: {
    key: 'hostel',
    title: 'Hostel',
    singular: 'Boarder',
    subtitle: 'Boarding check-in and occupancy',
    columns: cols(['name', 'Student'], ['block', 'Block'], ['bed', 'Bed'], ['status', 'Status']),
    fields: fields(['name', 'Student'], ['block', 'Block'], ['bed', 'Bed'], ['status', 'Status'], ['guardian', 'Guardian phone']),
    rows: [
      r('h-1187', 'Namutebi Racheal', 'In', { name: 'Namutebi Racheal', block: "St. Mary's", bed: 'B14', status: 'In', guardian: '+256 774 881 902' }),
      r('h-2210', 'Nabatanzi Joy', 'Weekend out', { name: 'Nabatanzi Joy', block: "St. Mary's", bed: 'B09', status: 'Weekend out', guardian: '+256 772 100 221' }),
      r('h-1788', 'Kato Brian', 'In', { name: 'Kato Brian', block: "St. Peter's", bed: 'A03', status: 'In', guardian: '+256 701 334 110' }),
      r('h-1650', 'Ssali Ivan', 'Leave', { name: 'Ssali Ivan', block: "St. Peter's", bed: 'A11', status: 'Leave', guardian: '+256 752 880 114' }),
    ],
  },
  visitors: {
    key: 'visitors',
    title: 'Visitors & Gate',
    singular: 'Visit',
    subtitle: 'Gate log and badges',
    columns: cols(['name', 'Visitor'], ['host', 'Host'], ['purpose', 'Purpose'], ['in', 'In'], ['status', 'Status']),
    fields: fields(['name', 'Visitor'], ['host', 'Host'], ['purpose', 'Purpose'], ['in', 'Checked in'], ['status', 'Status'], ['id', 'ID shown']),
    rows: [
      r('v1', 'Rose Nakiwala', 'On site', { name: 'Rose Nakiwala', host: 'Nakiwala Faith', purpose: 'Fee query', in: '08:40', status: 'On site', id: 'National ID' }),
      r('v2', 'Chemtech Ltd', 'Checked out', { name: 'Chemtech Ltd', host: 'Lab store', purpose: 'Delivery', in: '09:15', status: 'Checked out', id: 'Delivery note' }),
      r('v3', 'UNEB officer', 'Expected', { name: 'UNEB officer', host: 'Headteacher', purpose: 'Inspection', in: '—', status: 'Expected', id: 'Letter' }),
      r('v4', 'Kalema P.', 'On site', { name: 'Kalema P.', host: 'Transport desk', purpose: 'Spare keys', in: '10:05', status: 'On site', id: 'Staff card' }),
    ],
  },
  meetings: {
    key: 'meetings',
    title: 'Meetings',
    singular: 'Meeting',
    subtitle: 'PTM slots and visit requests',
    columns: cols(['title', 'Meeting'], ['who', 'With'], ['when', 'When'], ['status', 'Status']),
    fields: fields(['title', 'Meeting'], ['who', 'With'], ['when', 'When'], ['status', 'Status'], ['place', 'Place']),
    rows: [
      r('m1', 'Parents’ day — Primary Five', 'Booked', { title: 'Parents’ day — Primary Five', who: 'B. Ssentongo', when: '26 Sep, 9:00', status: 'Booked', place: 'Hall A' }),
      r('m2', 'Fee plan — Namutebi', 'Requested', { title: 'Fee plan — Namutebi', who: 'B. Kato', when: '12 Sep, 14:00', status: 'Requested', place: 'Accounts' }),
      r('m3', 'Admissions interview', 'Confirmed', { title: 'Admissions interview', who: 'Namuli Grace', when: '11 Sep, 10:00', status: 'Confirmed', place: 'Registrar' }),
      r('m4', 'House tutors briefing', 'Done', { title: 'House tutors briefing', who: 'All tutors', when: '8 Sep, 16:00', status: 'Done', place: 'Staff room' }),
    ],
  },
  calendar: {
    key: 'calendar',
    title: 'Calendar',
    singular: 'Event',
    subtitle: 'Term dates and school events',
    columns: cols(['title', 'Event'], ['date', 'Date'], ['type', 'Type'], ['audience', 'Audience']),
    fields: fields(['title', 'Event'], ['date', 'Date'], ['type', 'Type'], ['audience', 'Audience']),
    rows: [],
  },
  welfare: {
    key: 'welfare',
    title: 'Welfare',
    singular: 'Case',
    subtitle: 'Discipline and pastoral cases',
    columns: cols(['title', 'Case'], ['student', 'Student'], ['when', 'When'], ['status', 'Status']),
    fields: fields(['title', 'Case'], ['student', 'Student'], ['when', 'When'], ['status', 'Status'], ['action', 'Action']),
    rows: [
      r('w1', 'Late to assembly ×3', 'Open', { title: 'Late to assembly ×3', student: 'Okello Derrick', when: 'This week', status: 'Open', action: 'Talk with class teacher' }),
      r('w2', 'Uniform reminder', 'Closed', { title: 'Uniform reminder', student: 'Kato Brian', when: '2 Sep', status: 'Closed', action: 'Resolved with parent' }),
      r('w3', 'Counselling follow-up', 'Watch', { title: 'Counselling follow-up', student: 'Namutebi Racheal', when: 'Ongoing', status: 'Watch', action: 'Weekly check-in' }),
      r('w4', 'Playground incident', 'Review', { title: 'Playground incident', student: 'Ssali Ivan', when: '8 Sep', status: 'Review', action: 'Statements collected' }),
    ],
  },
  health: {
    key: 'health',
    title: 'Health',
    singular: 'Visit',
    subtitle: 'Sickbay visits and parent notifications',
    columns: cols(['name', 'Student'], ['reason', 'Reason'], ['action', 'Action'], ['time', 'Time'], ['notified', 'Parent']),
    fields: fields(['name', 'Student'], ['reason', 'Reason'], ['action', 'Action'], ['time', 'Time'], ['notified', 'Parent']),
    rows: [],
  },
  lifecycle: {
    key: 'lifecycle',
    title: 'Promotion & Alumni',
    singular: 'Record',
    subtitle: 'Promotion decisions and alumni',
    columns: cols(['name', 'Name'], ['from', 'From'], ['to', 'To'], ['status', 'Decision']),
    fields: fields(['name', 'Name'], ['from', 'From'], ['to', 'To'], ['status', 'Decision'], ['year', 'Year']),
    rows: [
      r('p1', 'Namutebi Racheal', 'Graduate', { name: 'Namutebi Racheal', from: 'Primary Seven', to: 'Completed PLE', status: 'Graduate', year: '2026' }),
      r('p2', 'Nakiwala Faith', 'Promote', { name: 'Nakiwala Faith', from: 'Primary Five', to: 'Primary Six', status: 'Promote', year: '2026' }),
      r('p3', 'Okello Derrick', 'Hold', { name: 'Okello Derrick', from: 'Primary Three', to: 'Primary Three', status: 'Hold', year: '2026' }, 'Attendance + fee follow-up first.'),
      r('a1', 'Namuli Sarah', 'Alumni', { name: 'Namuli Sarah', from: 'Primary Seven', to: 'Gayaza High School', status: 'Alumni', year: '2025' }),
    ],
  },
  documents: {
    key: 'documents',
    title: 'Documents',
    singular: 'Document',
    subtitle: 'Official letters and certificates',
    columns: cols(['name', 'Document'], ['for', 'Issued for'], ['when', 'When'], ['status', 'Status']),
    fields: fields(['name', 'Document'], ['for', 'Issued for'], ['when', 'When'], ['status', 'Status']),
    rows: [
      r('d1', 'Student ID card', 'Ready', { name: 'Student ID card', for: 'Nakiwala Faith', when: '4 Sep', status: 'Ready' }),
      r('d2', 'Admission letter', 'Draft', { name: 'Admission letter', for: 'Kato Brian', when: 'Today', status: 'Draft' }),
      r('d3', 'Transfer certificate', 'Issued', { name: 'Transfer certificate', for: 'Kirabo Alex', when: '28 Aug', status: 'Issued' }),
      r('d4', 'Staff payslip', 'Issued', { name: 'Staff payslip', for: 'Ssentongo B.', when: '31 Aug', status: 'Issued' }),
    ],
  },
  website: {
    key: 'website',
    title: 'Website',
    singular: 'Page',
    subtitle: 'Public CMS pages',
    columns: cols(['title', 'Page'], ['status', 'Status'], ['updated', 'Updated']),
    fields: fields(['title', 'Page'], ['status', 'Status'], ['updated', 'Updated']),
    rows: [],
  },
  ai: {
    key: 'ai',
    title: 'AI Assistant',
    singular: 'Draft',
    subtitle: 'Saved AI drafts for staff',
    columns: cols(['title', 'Draft'], ['kind', 'Type'], ['owner', 'Owner'], ['status', 'Status']),
    fields: fields(['title', 'Draft'], ['kind', 'Type'], ['owner', 'Owner'], ['status', 'Status']),
    rows: [
      r('ai1', 'Fee reminder SMS', 'Saved', { title: 'Fee reminder SMS', kind: 'SMS', owner: 'B. Kato', status: 'Saved' }),
      r('ai2', 'Parents’ day speech', 'Draft', { title: 'Parents’ day speech', kind: 'Speech', owner: 'Grace Nakato', status: 'Draft' }),
      r('ai3', 'P5 report comments', 'Used', { title: 'P5 report comments', kind: 'Comments', owner: 'B. Ssentongo', status: 'Used' }),
      r('ai4', 'Admissions FAQ', 'Saved', { title: 'Admissions FAQ', kind: 'Web copy', owner: 'Registrar', status: 'Saved' }),
    ],
  },
  system: {
    key: 'system',
    title: 'System & Audit',
    singular: 'Audit event',
    subtitle: 'Access, imports and permission changes',
    columns: cols(['who', 'Actor'], ['action', 'Action'], ['module', 'Module'], ['when', 'When'], ['status', 'Result']),
    fields: fields(['who', 'Actor'], ['action', 'Action'], ['module', 'Module'], ['when', 'When'], ['status', 'Result']),
    rows: [
      r('au1', 'Grace Nakato signed in', 'OK', { who: 'Grace Nakato', action: 'Signed in', module: 'Auth', when: 'Today, 7:12am', status: 'OK' }),
      r('au2', 'B. Kato exported ledger', 'OK', { who: 'B. Kato', action: 'Exported CSV', module: 'Finance', when: 'Yesterday', status: 'OK' }),
      r('au3', 'Teacher role — Finance view off', 'Changed', { who: 'Grace Nakato', action: 'Toggled permission', module: 'RBAC', when: '6 Sep', status: 'Changed' }),
      r('au4', 'Student import preview', 'Review', { who: 'Registrar', action: 'CSV preview', module: 'Students', when: '5 Sep', status: 'Review' }),
    ],
  },
  profile: {
    key: 'profile',
    title: 'My profile',
    singular: 'Activity',
    subtitle: 'Your account activity on School OS',
    columns: cols(['action', 'Action'], ['detail', 'Detail'], ['when', 'When'], ['status', 'Status']),
    fields: fields(['action', 'Action'], ['detail', 'Detail'], ['when', 'When'], ['status', 'Status']),
    rows: [
      r('me1', 'Signed in', 'OK', { action: 'Signed in', detail: 'Kampala · Chrome', when: 'Today, 7:12am', status: 'OK' }),
      r('me2', 'Updated phone', 'Saved', { action: 'Updated phone', detail: 'Profile details', when: '2 Sep', status: 'Saved' }),
      r('me3', 'Downloaded report', 'OK', { action: 'Downloaded report', detail: 'Term 2 report cards', when: '5 Sep', status: 'OK' }),
      r('me4', 'Password last changed', 'Secure', { action: 'Password last changed', detail: 'Security tab', when: '18 Aug', status: 'Secure' }),
    ],
  },
};

export const MODULE_KEYS = Object.keys(MODULE_DEFS);
