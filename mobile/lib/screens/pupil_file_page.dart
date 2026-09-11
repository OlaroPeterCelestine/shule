import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';

class PupilFilePage extends StatefulWidget {
  const PupilFilePage({super.key, required this.session, required this.student});

  final Session session;
  final Student student;

  @override
  State<PupilFilePage> createState() => _PupilFilePageState();
}

class _PupilFilePageState extends State<PupilFilePage> {
  List<Visit> _visits = [];
  RegisterRow? _mark;
  bool _loading = true;

  Student get student => widget.student;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final visits = await widget.session.api.visits();
      final register = await widget.session.api.register();
      if (!mounted) return;
      setState(() {
        _visits = visits.where((v) => v.adm == student.adm).toList();
        _mark = register.where((r) => r.adm == student.adm).firstOrNull;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  Future<void> _openPdf() async {
    try {
      final file = await widget.session.api.reportCardPdf(student.adm);
      await OpenFilex.open(file.path);
    } catch (error) {
      if (mounted) showApiError(context, error);
    }
  }

  String _markLabel() {
    switch (_mark?.status) {
      case 'P':
        return 'Present';
      case 'A':
        return 'Absent';
      case 'L':
        return 'Late';
      case 'E':
        return 'Excused';
      default:
        return 'No mark today';
    }
  }

  @override
  Widget build(BuildContext context) {
    final canPdf = widget.session.access.can('reports') || widget.session.access.can('documents');
    return Scaffold(
      appBar: AppBar(title: const Text('Pupil file')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            if (_loading) const LinearProgressIndicator(minHeight: 2),
            Text(student.name, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700, color: brandNavy)),
            const SizedBox(height: 4),
            Text('${student.adm} · ${student.cls}', style: const TextStyle(color: Colors.black54)),
            const SizedBox(height: 16),
            _section('Overview', [
              _row('Gender', student.gender.isEmpty ? '—' : student.gender),
              _row('Date of birth', student.dob.isEmpty ? '—' : student.dob),
              _row('Attendance', student.attendance),
              _row('Fees', student.feeLabel.isEmpty ? student.fee : student.feeLabel),
            ]),
            _section('Guardian', [
              _row('Name', student.guardian.isEmpty ? '—' : student.guardian),
              _row('Phone', student.guardianPhone.isEmpty ? '—' : student.guardianPhone),
            ]),
            _section('Attendance', [_row('Today', _markLabel()), _row('Term rate', student.attendance)]),
            _section(
              'Health',
              _visits.isEmpty
                  ? [_row('Sickbay', 'No visits on this file')]
                  : _visits.map((v) => _row(v.reason, '${v.action} · ${v.time}')).toList(),
            ),
            _section('Reports', [_row('Report card', 'End-of-term PDF from the API')]),
            if (canPdf)
              FilledButton.icon(
                onPressed: _openPdf,
                icon: const Icon(Icons.picture_as_pdf_outlined),
                label: const Text('Open report card PDF'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, List<Widget> children) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE8ECF0)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: brandNavy)),
              const SizedBox(height: 8),
              ...children,
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(color: Colors.black45, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
