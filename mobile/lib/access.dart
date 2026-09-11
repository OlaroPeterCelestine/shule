import 'models.dart';

class Access {
  Access({required this.role, required this.perms});

  final String role;
  final List<PermRow> perms;

  static const open = {'dashboard', 'profile', 'home'};

  static const roleView = <String, Set<String>>{
    'teacher': {
      'dashboard',
      'students',
      'reports',
      'documents',
      'comms',
      'curriculum',
      'academics',
      'assessments',
      'attendance',
      'library',
      'meetings',
      'feedback',
      'calendar',
      'health',
      'inventory',
      'ai',
      'profile',
      'clock',
    },
    'accountant': {'dashboard', 'students', 'finance', 'reports', 'comms', 'documents', 'calendar', 'inventory', 'profile'},
    'parent': {
      'dashboard',
      'students',
      'finance',
      'reports',
      'comms',
      'transport',
      'meetings',
      'feedback',
      'calendar',
      'health',
      'profile',
    },
    'nurse': {'dashboard', 'students', 'health', 'profile'},
    'registrar': {'dashboard', 'admissions', 'students', 'feedback', 'profile'},
  };

  static const teacherWrite = {'students', 'admissions', 'attendance', 'health', 'clock', 'academics', 'inventory'};

  bool can(String module, [String action = 'view']) {
    if (role == 'admin') return true;
    if (action == 'view' && open.contains(module)) return true;
    for (final row in perms) {
      if (row.module != module) continue;
      switch (action) {
        case 'create':
          return row.create;
        case 'edit':
          return row.edit;
        case 'approve':
          return row.approve;
        default:
          return row.view;
      }
    }
    if (action == 'view') return roleView[role]?.contains(module) ?? false;
    if (role == 'teacher') return teacherWrite.contains(module);
    if (role == 'accountant') return module == 'finance';
    if (role == 'nurse') return module == 'health' && (action == 'create' || action == 'edit');
    if (role == 'registrar') return module == 'admissions';
    return false;
  }
}
