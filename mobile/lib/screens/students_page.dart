import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';

class StudentsPage extends StatefulWidget {
  const StudentsPage({super.key, required this.session});

  final Session session;

  @override
  State<StudentsPage> createState() => _StudentsPageState();
}

class _StudentsPageState extends State<StudentsPage> {
  List<Student> _all = [];
  String _query = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final rows = await widget.session.api.students();
      if (!mounted) return;
      setState(() {
        _all = rows;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  Future<void> _openPdf(Student student) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Opening report card for ${student.name}…')));
      final file = await widget.session.api.reportCardPdf(student.adm);
      await OpenFilex.open(file.path);
    } catch (error) {
      if (mounted) showApiError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final rows = q.isEmpty
        ? _all
        : _all.where((s) => s.name.toLowerCase().contains(q) || s.adm.toLowerCase().contains(q) || s.cls.toLowerCase().contains(q)).toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Pupils')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Search name, admission or class'),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                itemCount: rows.length,
                itemBuilder: (context, i) {
                  final s = rows[i];
                  return ListTile(
                    title: Text(s.name),
                    subtitle: Text('${s.adm} · ${s.cls} · ${s.feeLabel.isEmpty ? s.fee : s.feeLabel}'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => showModalBottomSheet<void>(
                      context: context,
                      showDragHandle: true,
                      builder: (_) => _StudentSheet(
                        student: s,
                        canPdf: widget.session.access.can('reports') || widget.session.access.can('documents'),
                        onPdf: () => _openPdf(s),
                      ),
                    ),
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

class _StudentSheet extends StatelessWidget {
  const _StudentSheet({required this.student, required this.onPdf, this.canPdf = true});

  final Student student;
  final VoidCallback onPdf;
  final bool canPdf;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(student.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text('${student.adm} · ${student.cls}'),
          if (student.gender.isNotEmpty || student.dob.isNotEmpty) Text([student.gender, student.dob].where((s) => s.isNotEmpty).join(' · ')),
          const SizedBox(height: 8),
          Text('Guardian: ${student.guardian.isEmpty ? '—' : student.guardian}'),
          if (student.guardianPhone.isNotEmpty) Text(student.guardianPhone),
          if (canPdf) ...[
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () {
                Navigator.pop(context);
                onPdf();
              },
              icon: const Icon(Icons.picture_as_pdf_outlined),
              label: const Text('Open report card PDF'),
            ),
          ],
        ],
      ),
    );
  }
}
