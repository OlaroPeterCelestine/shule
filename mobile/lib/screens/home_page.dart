import 'package:flutter/material.dart';

import '../api.dart';
import '../models.dart';
import '../session.dart';
import '../theme.dart';
import '../widgets/school_banner.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.session});

  final Session session;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  ClockMine? _clock;
  SchoolProfile? _school;
  List<RegisterRow> _register = [];
  List<ExamPaper> _exams = [];
  List<StockItem> _stock = [];
  bool _loading = true;
  bool _clocking = false;

  Api get _api => widget.session.api;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    setState(() => _loading = true);
    try {
      final access = widget.session.access;
      final school = await _api.school();
      ClockMine? clock;
      var register = <RegisterRow>[];
      var exams = <ExamPaper>[];
      if (access.can('clock')) {
        try {
          clock = await _api.myClock();
        } catch (_) {}
      }
      if (access.can('attendance')) {
        try {
          register = await _api.register();
        } catch (_) {}
      }
      if (access.can('academics')) {
        try {
          exams = await _api.exams();
        } catch (_) {}
      }
      var stock = <StockItem>[];
      if (access.can('inventory')) {
        try {
          stock = await _api.stock();
        } catch (_) {}
      }
      if (!mounted) return;
      setState(() {
        _clock = clock;
        _school = school;
        _register = register;
        _exams = exams;
        _stock = stock;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  Future<void> _punch(bool clockIn) async {
    setState(() => _clocking = true);
    try {
      if (clockIn) {
        await _api.clockIn();
      } else {
        await _api.clockOut();
      }
      await _refresh();
    } catch (error) {
      if (mounted) showApiError(context, error);
    } finally {
      if (mounted) setState(() => _clocking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.session.user;
    final access = widget.session.access;
    final open = _clock?.open;
    final present = _register.where((r) => r.status == 'P' || r.status == 'L').length;
    final upcoming = _exams.take(4).toList();
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            SchoolBanner(school: _school),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Good day, ${user?.name ?? 'there'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: brandNavy, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(
                    '${user?.label ?? 'Teacher'} · Seguku · Africa/Kampala',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: brandNavy.withValues(alpha: 0.65)),
                  ),
                  const SizedBox(height: 16),
                  if (access.can('clock', 'create')) ...[
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Staff clock', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Text(
                              open != null ? 'On campus since ${open.inAt} (Kampala)' : 'You are clocked out',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            if (_clock != null && _clock!.today.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(
                                _clock!.today.map((p) => p.outAt == null ? '${p.inAt}–now' : '${p.inAt}–${p.outAt}${p.hours != null ? ' · ${p.hours}' : ''}').join('  ·  '),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                            const SizedBox(height: 16),
                            FilledButton(
                              onPressed: _clocking || _loading ? null : () => _punch(open == null),
                              child: Text(_clocking ? 'Saving…' : open == null ? 'Clock in' : 'Clock out'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (access.can('attendance')) ...[
                    Row(
                      children: [
                        Expanded(child: _StatCard(label: 'Present / late', value: _loading ? '—' : '$present')),
                        const SizedBox(width: 12),
                        Expanded(child: _StatCard(label: 'On register', value: _loading ? '—' : '${_register.length}')),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('By class', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700, color: brandNavy)),
                    const SizedBox(height: 8),
                    for (final cls in schoolClasses.where((c) => _register.any((r) => r.cls == c)))
                      _ClassRate(cls: cls, rows: _register.where((r) => r.cls == cls).toList()),
                    const SizedBox(height: 16),
                  ],
                  if (access.can('inventory')) ...[
                    Text('Stores', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700, color: brandNavy)),
                    const SizedBox(height: 8),
                    Card(
                      child: ListTile(
                        title: Text(_loading ? '—' : '${_stock.length} items · ${_stock.where((i) => i.low).length} low'),
                        subtitle: Text(
                          _stock.where((i) => i.low).isEmpty
                              ? 'Stationery, uniforms and classroom kit'
                              : _stock.where((i) => i.low).take(3).map((i) => '${i.name} (${i.qty})').join(' · '),
                        ),
                        trailing: const Icon(Icons.inventory_2_outlined),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (access.can('academics')) ...[
                    Text('Upcoming papers', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700, color: brandNavy)),
                    const SizedBox(height: 8),
                    if (upcoming.isEmpty && !_loading) const Text('No exams scheduled yet. Create a sitting on the web Timetable & Exams page.'),
                    for (final e in upcoming)
                      Card(
                        child: ListTile(
                          title: Text('${e.cls} · ${e.subject}'),
                          subtitle: Text('${e.kind} · ${e.examDate} ${e.startTime} · ${e.room}'),
                          trailing: Text(e.status, style: const TextStyle(color: brandGold, fontWeight: FontWeight.w600, fontSize: 12)),
                        ),
                      ),
                  ],
                  if (!access.can('attendance') && !access.can('academics') && !access.can('clock', 'create'))
                    Text(
                      'Signed in as ${user?.label ?? user?.role ?? 'staff'}. Open More for your profile, or use the web OS for modules this role can see.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: brandGreen, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}

class _ClassRate extends StatelessWidget {
  const _ClassRate({required this.cls, required this.rows});

  final String cls;
  final List<RegisterRow> rows;

  @override
  Widget build(BuildContext context) {
    final here = rows.where((r) => r.status == 'P' || r.status == 'L').length;
    final rate = rows.isEmpty ? 0.0 : here / rows.length;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(cls, style: const TextStyle(fontWeight: FontWeight.w600))),
              Text('$here / ${rows.length}', style: const TextStyle(color: brandGreen, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(value: rate, minHeight: 6, color: brandGreen, backgroundColor: const Color(0xFFE1E5EA)),
          ),
        ],
      ),
    );
  }
}
