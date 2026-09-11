import 'package:flutter/material.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';

class HealthPage extends StatefulWidget {
  const HealthPage({super.key, required this.session});

  final Session session;

  @override
  State<HealthPage> createState() => _HealthPageState();
}

class _HealthPageState extends State<HealthPage> {
  List<Visit> _visits = [];
  List<Student> _students = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final visits = await widget.session.api.visits();
      final students = await widget.session.api.students();
      if (!mounted) return;
      setState(() {
        _visits = visits;
        _students = students;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  Future<void> _compose() async {
    if (_students.isEmpty) {
      showApiError(context, 'No pupils loaded yet');
      return;
    }
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _VisitForm(students: _students, session: widget.session),
    );
    if (saved == true) await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sickbay')),
      floatingActionButton: widget.session.access.can('health', 'create')
          ? FloatingActionButton.extended(
              onPressed: _compose,
              icon: const Icon(Icons.add),
              label: const Text('Log visit'),
            )
          : null,
      body: Column(
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _visits.isEmpty && !_loading
                  ? ListView(children: const [SizedBox(height: 80), Center(child: Text('No sickbay visits yet'))])
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(8, 8, 8, 88),
                      itemCount: _visits.length,
                      separatorBuilder: (_, _) => const Divider(height: 1),
                      itemBuilder: (context, i) {
                        final v = _visits[i];
                        return ListTile(
                          title: Text(v.name),
                          subtitle: Text('${v.reason} · ${v.action}'),
                          trailing: Text(v.time, style: Theme.of(context).textTheme.bodySmall),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VisitForm extends StatefulWidget {
  const _VisitForm({required this.students, required this.session});

  final List<Student> students;
  final Session session;

  @override
  State<_VisitForm> createState() => _VisitFormState();
}

class _VisitFormState extends State<_VisitForm> {
  late String _adm;
  final _reason = TextEditingController();
  final _action = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _adm = widget.students.first.adm;
  }

  @override
  void dispose() {
    _reason.dispose();
    _action.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      await widget.session.api.addVisit(adm: _adm, reason: _reason.text.trim(), action: _action.text.trim());
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) showApiError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final inset = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 0, 20, 20 + inset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Log sickbay visit', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _adm,
            items: [
              for (final s in widget.students) DropdownMenuItem(value: s.adm, child: Text('${s.name} · ${s.adm}')),
            ],
            onChanged: (v) => setState(() => _adm = v ?? _adm),
            decoration: const InputDecoration(labelText: 'Pupil'),
          ),
          const SizedBox(height: 12),
          TextField(controller: _reason, decoration: const InputDecoration(labelText: 'Reason')),
          const SizedBox(height: 12),
          TextField(controller: _action, decoration: const InputDecoration(labelText: 'Action')),
          const SizedBox(height: 16),
          FilledButton(onPressed: _busy ? null : _save, child: Text(_busy ? 'Saving…' : 'Save visit')),
        ],
      ),
    );
  }
}
