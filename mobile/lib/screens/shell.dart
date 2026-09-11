import 'package:flutter/material.dart';

import '../session.dart';
import 'health_page.dart';
import 'home_page.dart';
import 'inventory_page.dart';
import 'more_page.dart';
import 'register_page.dart';
import 'students_page.dart';

class _Tab {
  const _Tab({required this.key, required this.label, required this.icon, required this.selected, required this.page});

  final String key;
  final String label;
  final IconData icon;
  final IconData selected;
  final Widget page;
}

class TeacherShell extends StatefulWidget {
  const TeacherShell({super.key, required this.session});

  final Session session;

  @override
  State<TeacherShell> createState() => _TeacherShellState();
}

class _TeacherShellState extends State<TeacherShell> {
  int _index = 0;

  List<_Tab> get _tabs {
    final session = widget.session;
    final access = session.access;
    return [
      _Tab(key: 'home', label: 'Home', icon: Icons.home_outlined, selected: Icons.home, page: HomePage(session: session)),
      if (access.can('attendance'))
        _Tab(key: 'register', label: 'Register', icon: Icons.how_to_reg_outlined, selected: Icons.how_to_reg, page: RegisterPage(session: session)),
      if (access.can('students'))
        _Tab(key: 'pupils', label: 'Pupils', icon: Icons.groups_outlined, selected: Icons.groups, page: StudentsPage(session: session)),
      if (access.can('health'))
        _Tab(key: 'sickbay', label: 'Sickbay', icon: Icons.medical_services_outlined, selected: Icons.medical_services, page: HealthPage(session: session)),
      if (access.can('inventory'))
        _Tab(key: 'stores', label: 'Stores', icon: Icons.inventory_2_outlined, selected: Icons.inventory_2, page: InventoryPage(session: session)),
      _Tab(key: 'more', label: 'More', icon: Icons.more_horiz, selected: Icons.more_horiz, page: MorePage(session: session)),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _tabs;
    final index = _index.clamp(0, tabs.length - 1);
    return Scaffold(
      body: tabs[index].page,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          for (final tab in tabs)
            NavigationDestination(icon: Icon(tab.icon), selectedIcon: Icon(tab.selected), label: tab.label),
        ],
      ),
    );
  }
}
