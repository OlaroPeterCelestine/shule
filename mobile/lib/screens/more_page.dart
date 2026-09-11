import 'package:flutter/material.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';
import '../widgets/school_banner.dart';

class MorePage extends StatefulWidget {
  const MorePage({super.key, required this.session});

  final Session session;

  @override
  State<MorePage> createState() => _MorePageState();
}

class _MorePageState extends State<MorePage> {
  List<SchoolEvent> _events = [];
  List<ExamPaper> _exams = [];
  SchoolProfile? _school;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final access = widget.session.access;
      final school = await widget.session.api.school();
      var events = <SchoolEvent>[];
      var exams = <ExamPaper>[];
      if (access.can('calendar')) {
        try {
          events = await widget.session.api.events();
        } catch (_) {}
      }
      if (access.can('academics')) {
        try {
          exams = await widget.session.api.exams();
        } catch (_) {}
      }
      if (!mounted) return;
      setState(() {
        _events = events;
        _exams = exams;
        _school = school;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.session.user;
    final access = widget.session.access;
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            SchoolBanner(school: _school, compact: true),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(user?.name ?? 'Teacher'),
                    subtitle: Text('${user?.label ?? user?.role ?? ''} · ${user?.email ?? ''}'),
                  ),
                  Text('Signed in against ${widget.session.baseUrl}', style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 16),
                  if (_loading) const LinearProgressIndicator(minHeight: 2, color: brandGreen),
                  if (access.can('calendar') || access.can('academics')) ...[
                    Text('School calendar', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Events this role can see.', style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 8),
                    if (_events.isEmpty && _exams.isEmpty && !_loading) const Text('No events on the school calendar yet.'),
                    if (access.can('calendar'))
                      for (final e in _events)
                        Card(
                          child: ListTile(
                            title: Text(e.title),
                            subtitle: Text('${e.date} · ${e.type} · ${e.audience}'),
                            trailing: Text(e.type, style: const TextStyle(fontSize: 11, color: brandGold, fontWeight: FontWeight.w600)),
                          ),
                        ),
                    if (access.can('academics'))
                      for (final e in _exams)
                        Card(
                          child: ListTile(
                            title: Text('${e.subject} · ${e.cls}'),
                            subtitle: Text('${e.kind} · ${e.examDate} ${e.startTime} · ${e.room}'),
                            trailing: const Text('Exams', style: TextStyle(fontSize: 11, color: brandGold, fontWeight: FontWeight.w600)),
                          ),
                        ),
                    const SizedBox(height: 12),
                  ],
                  OutlinedButton(onPressed: widget.session.signOut, child: const Text('Sign out')),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
