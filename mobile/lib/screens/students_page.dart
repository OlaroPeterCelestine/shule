import 'package:flutter/material.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';
import 'pupil_file_page.dart';

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
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => PupilFilePage(session: widget.session, student: s),
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
