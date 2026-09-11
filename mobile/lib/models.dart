class SessionUser {
  SessionUser({required this.name, required this.email, required this.role, required this.label});

  final String name;
  final String email;
  final String role;
  final String label;

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    return SessionUser(
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? '',
      label: json['label'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'name': name, 'email': email, 'role': role, 'label': label};
}

class PermRow {
  PermRow({
    required this.role,
    required this.module,
    required this.view,
    required this.create,
    required this.edit,
    required this.approve,
  });

  final String role;
  final String module;
  final bool view;
  final bool create;
  final bool edit;
  final bool approve;

  factory PermRow.fromJson(Map<String, dynamic> json) {
    return PermRow(
      role: json['role'] as String? ?? '',
      module: json['module'] as String? ?? '',
      view: json['view'] == true,
      create: json['create'] == true,
      edit: json['edit'] == true,
      approve: json['approve'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'role': role,
        'module': module,
        'view': view,
        'create': create,
        'edit': edit,
        'approve': approve,
      };
}

class Student {
  Student({
    required this.adm,
    required this.name,
    required this.cls,
    required this.guardian,
    required this.guardianPhone,
    required this.attendance,
    required this.fee,
    required this.feeLabel,
    required this.gender,
    required this.dob,
  });

  final String adm;
  final String name;
  final String cls;
  final String guardian;
  final String guardianPhone;
  final String attendance;
  final String fee;
  final String feeLabel;
  final String gender;
  final String dob;

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      adm: json['adm'] as String? ?? '',
      name: json['name'] as String? ?? '',
      cls: json['cls'] as String? ?? '',
      guardian: json['guardian'] as String? ?? '',
      guardianPhone: json['guardianPhone'] as String? ?? '',
      attendance: json['attendance'] as String? ?? '—',
      fee: json['fee'] as String? ?? '',
      feeLabel: json['feeLabel'] as String? ?? '',
      gender: json['gender'] as String? ?? '',
      dob: json['dob'] as String? ?? '',
    );
  }
}

class RegisterRow {
  RegisterRow({required this.adm, required this.name, required this.cls, required this.status});

  final String adm;
  final String name;
  final String cls;
  String status;

  factory RegisterRow.fromJson(Map<String, dynamic> json) {
    return RegisterRow(
      adm: json['adm'] as String? ?? '',
      name: json['name'] as String? ?? '',
      cls: json['cls'] as String? ?? '',
      status: json['status'] as String? ?? 'P',
    );
  }
}

class ClockPunch {
  ClockPunch({required this.open, required this.inAt, this.outAt, this.hours});

  final bool open;
  final String inAt;
  final String? outAt;
  final String? hours;

  factory ClockPunch.fromJson(Map<String, dynamic> json) {
    return ClockPunch(
      open: json['open'] == true,
      inAt: json['inAt'] as String? ?? '',
      outAt: json['outAt'] as String?,
      hours: json['hours'] as String?,
    );
  }
}

class ClockMine {
  ClockMine({this.open, required this.today});

  final ClockPunch? open;
  final List<ClockPunch> today;

  factory ClockMine.fromJson(Map<String, dynamic> json) {
    final open = json['open'];
    return ClockMine(
      open: open is Map<String, dynamic> ? ClockPunch.fromJson(open) : null,
      today: (json['today'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ClockPunch.fromJson)
          .toList(),
    );
  }
}

class Visit {
  Visit({required this.id, required this.adm, required this.name, required this.reason, required this.action, required this.time});

  final String id;
  final String adm;
  final String name;
  final String reason;
  final String action;
  final String time;

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      id: '${json['id']}',
      adm: json['adm'] as String? ?? '',
      name: json['name'] as String? ?? '',
      reason: json['reason'] as String? ?? '',
      action: json['action'] as String? ?? '',
      time: json['time'] as String? ?? '',
    );
  }
}

class SchoolEvent {
  SchoolEvent({required this.title, required this.date, required this.type, required this.audience});

  final String title;
  final String date;
  final String type;
  final String audience;

  factory SchoolEvent.fromJson(Map<String, dynamic> json) {
    return SchoolEvent(
      title: json['title'] as String? ?? '',
      date: json['date'] as String? ?? '',
      type: json['type'] as String? ?? '',
      audience: json['audience'] as String? ?? '',
    );
  }
}

class ReportCard {
  ReportCard({required this.adm, required this.name, required this.cls, required this.average, required this.grade});

  final String adm;
  final String name;
  final String cls;
  final num average;
  final String grade;

  factory ReportCard.fromJson(Map<String, dynamic> json) {
    return ReportCard(
      adm: json['adm'] as String? ?? '',
      name: json['name'] as String? ?? '',
      cls: json['cls'] as String? ?? '',
      average: json['average'] as num? ?? 0,
      grade: json['grade'] as String? ?? '',
    );
  }
}

class ExamPaper {
  ExamPaper({
    required this.id,
    required this.kind,
    required this.title,
    required this.cls,
    required this.subject,
    required this.term,
    required this.year,
    required this.examDate,
    required this.startTime,
    required this.duration,
    required this.room,
    required this.invigilator,
    required this.status,
  });

  final int id;
  final String kind;
  final String title;
  final String cls;
  final String subject;
  final String term;
  final String year;
  final String examDate;
  final String startTime;
  final int duration;
  final String room;
  final String invigilator;
  final String status;

  factory ExamPaper.fromJson(Map<String, dynamic> json) {
    return ExamPaper(
      id: (json['id'] as num?)?.toInt() ?? 0,
      kind: json['kind'] as String? ?? '',
      title: json['title'] as String? ?? '',
      cls: json['cls'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      term: json['term'] as String? ?? '',
      year: json['year'] as String? ?? '',
      examDate: json['examDate'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      duration: (json['duration'] as num?)?.toInt() ?? 0,
      room: json['room'] as String? ?? '',
      invigilator: json['invigilator'] as String? ?? '',
      status: json['status'] as String? ?? '',
    );
  }
}

class StockItem {
  StockItem({
    required this.id,
    required this.name,
    required this.category,
    required this.qty,
    required this.location,
  });

  final int id;
  final String name;
  final String category;
  int qty;
  final String location;

  bool get low => qty < 20;

  factory StockItem.fromJson(Map<String, dynamic> json) {
    return StockItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? '',
      qty: (json['qty'] as num?)?.toInt() ?? 0,
      location: json['location'] as String? ?? '',
    );
  }
}

class SchoolProfile {
  SchoolProfile({required this.name, required this.motto, required this.term, required this.year});

  final String name;
  final String motto;
  final String term;
  final String year;

  factory SchoolProfile.fromJson(Map<String, dynamic> json) {
    return SchoolProfile(
      name: json['name'] as String? ?? 'Little Royals',
      motto: json['motto'] as String? ?? '',
      term: json['term'] as String? ?? '',
      year: json['year'] as String? ?? '',
    );
  }
}
