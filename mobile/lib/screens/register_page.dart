import 'package:flutter/material.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';
import '../widgets/school_banner.dart';

const marks = ['P', 'A', 'L', 'E'];
const markLabels = {'P': 'Present', 'A': 'Absent', 'L': 'Late', 'E': 'Excused'};

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key, required this.session});

  final Session session;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  List<RegisterRow> _rows = [];
  SchoolProfile? _school;
  String _cls = 'All';
  bool _loading = true;
  bool _bulk = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final rows = await widget.session.api.register();
      final school = await widget.session.api.school();
      if (!mounted) return;
      setState(() {
        _rows = rows;
        _school = school;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  List<String> get _classChips {
    final present = {for (final r in _rows) r.cls};
    return ['All', ...schoolClasses.where(present.contains), ...present.where((c) => !schoolClasses.contains(c))];
  }

  List<RegisterRow> get _visible {
    final rows = _cls == 'All' ? _rows : _rows.where((r) => r.cls == _cls);
    return rows.toList()..sort((a, b) {
      final ca = schoolClasses.indexOf(a.cls);
      final cb = schoolClasses.indexOf(b.cls);
      final ia = ca < 0 ? 99 : ca;
      final ib = cb < 0 ? 99 : cb;
      if (ia != ib) return ia.compareTo(ib);
      return a.name.compareTo(b.name);
    });
  }

  Future<void> _mark(RegisterRow row, String status) async {
    final previous = row.status;
    setState(() => row.status = status);
    try {
      final saved = await widget.session.api.mark(row.adm, status);
      if (!mounted) return;
      setState(() => row.status = saved.status);
    } catch (error) {
      if (!mounted) return;
      setState(() => row.status = previous);
      showApiError(context, error);
    }
  }

  Future<void> _markAllPresent() async {
    setState(() => _bulk = true);
    try {
      final saved = await widget.session.api.markBulk('P', _cls == 'All' ? null : _cls);
      if (!mounted) return;
      setState(() {
        if (saved.isNotEmpty) {
          final byAdm = {for (final r in saved) r.adm: r.status};
          for (final row in _rows) {
            if (byAdm.containsKey(row.adm)) row.status = byAdm[row.adm]!;
          }
        } else {
          for (final row in _visible) {
            row.status = 'P';
          }
        }
      });
    } catch (error) {
      if (mounted) showApiError(context, error);
    } finally {
      if (mounted) setState(() => _bulk = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canMark = widget.session.access.can('attendance', 'edit');
    final visible = _visible;
    final present = visible.where((r) => r.status == 'P').length;
    final late = visible.where((r) => r.status == 'L').length;
    final absent = visible.where((r) => r.status == 'A').length;
    final excused = visible.where((r) => r.status == 'E').length;
    return Scaffold(
      body: Column(
        children: [
          SchoolBanner(school: _school, compact: true),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Morning roll call', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: brandNavy, fontWeight: FontWeight.w700)),
                      Text('Baby–P7 · P present · A absent · L late · E excused', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                if (canMark)
                  TextButton(
                    onPressed: _bulk || _loading ? null : _markAllPresent,
                    child: Text(_bulk ? 'Saving…' : _cls == 'All' ? 'All present' : 'Class present'),
                  ),
              ],
            ),
          ),
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              children: [
                for (final cls in _classChips)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(cls),
                      selected: _cls == cls,
                      selectedColor: brandGreen.withValues(alpha: 0.16),
                      onSelected: (_) => setState(() => _cls = cls),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Row(
              children: [
                _CountChip(label: 'P', value: present, color: brandGreen),
                _CountChip(label: 'L', value: late, color: brandGold),
                _CountChip(label: 'A', value: absent, color: brandMaroon),
                _CountChip(label: 'E', value: excused, color: brandNavy),
              ],
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2, color: brandGreen),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(8, 0, 8, 24),
                itemCount: visible.length,
                itemBuilder: (context, i) {
                  final row = visible[i];
                  final showHeader = i == 0 || visible[i - 1].cls != row.cls;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (showHeader)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(8, 12, 8, 4),
                          child: Text(row.cls, style: const TextStyle(color: brandGold, fontWeight: FontWeight.w700)),
                        ),
                      ListTile(
                        title: Text(row.name),
                        subtitle: Text(row.adm),
                        trailing: canMark
                            ? Wrap(
                                spacing: 4,
                                children: [
                                  for (final mark in marks)
                                    ChoiceChip(
                                      label: Text(mark),
                                      selected: row.status == mark,
                                      tooltip: markLabels[mark],
                                      selectedColor: markColors[mark]!.withValues(alpha: 0.18),
                                      labelStyle: TextStyle(
                                        color: row.status == mark ? markColors[mark] : brandNavy,
                                        fontWeight: FontWeight.w700,
                                      ),
                                      visualDensity: VisualDensity.compact,
                                      onSelected: (_) => _mark(row, mark),
                                    ),
                                ],
                              )
                            : Text(row.status, style: const TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ],
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

class _CountChip extends StatelessWidget {
  const _CountChip({required this.label, required this.value, required this.color});

  final String label;
  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
        child: Column(
          children: [
            Text('$value', style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16)),
            Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
