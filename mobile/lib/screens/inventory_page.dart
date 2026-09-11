import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models.dart';
import '../session.dart';
import '../theme.dart';

class InventoryPage extends StatefulWidget {
  const InventoryPage({super.key, required this.session});

  final Session session;

  @override
  State<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends State<InventoryPage> {
  List<StockItem> _items = [];
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
      final items = await widget.session.api.stock();
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showApiError(context, error);
    }
  }

  List<StockItem> get _visible {
    final q = _query.trim().toLowerCase();
    final rows = q.isEmpty
        ? _items
        : _items
            .where(
              (i) =>
                  i.name.toLowerCase().contains(q) ||
                  i.category.toLowerCase().contains(q) ||
                  i.location.toLowerCase().contains(q),
            )
            .toList();
    rows.sort((a, b) {
      if (a.low != b.low) return a.low ? -1 : 1;
      return a.name.compareTo(b.name);
    });
    return rows;
  }

  Future<void> _stockIn() async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _StockInForm(session: widget.session),
    );
    if (saved == true) await _load();
  }

  Future<void> _issue(StockItem item) async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _IssueForm(session: widget.session, item: item),
    );
    if (saved == true) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final access = widget.session.access;
    final visible = _visible;
    final low = _items.where((i) => i.low).length;
    final units = _items.fold<int>(0, (n, i) => n + i.qty);
    return Scaffold(
      appBar: AppBar(title: const Text('Stores')),
      floatingActionButton: access.can('inventory', 'create')
          ? FloatingActionButton.extended(
              onPressed: _stockIn,
              icon: const Icon(Icons.add),
              label: const Text('Stock in'),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(
              children: [
                Expanded(child: _StatChip(label: 'Items', value: _loading ? '—' : '${_items.length}', color: brandNavy)),
                Expanded(child: _StatChip(label: 'Units', value: _loading ? '—' : '$units', color: brandGreen)),
                Expanded(child: _StatChip(label: 'Low', value: _loading ? '—' : '$low', color: brandMaroon)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Search item, category or store'),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2, color: brandGreen),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: visible.isEmpty && !_loading
                  ? ListView(children: const [SizedBox(height: 80), Center(child: Text('No stock on the books yet'))])
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(8, 0, 8, 88),
                      itemCount: visible.length,
                      separatorBuilder: (_, _) => const Divider(height: 1),
                      itemBuilder: (context, i) {
                        final item = visible[i];
                        return ListTile(
                          title: Text(item.name),
                          subtitle: Text('${item.category} · ${item.location}'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${item.qty}',
                                style: TextStyle(
                                  color: item.low ? brandMaroon : brandGreen,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              if (access.can('inventory', 'edit')) ...[
                                const SizedBox(width: 8),
                                TextButton(onPressed: () => _issue(item), child: const Text('Issue')),
                              ],
                            ],
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

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
      child: Column(
        children: [
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16)),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _StockInForm extends StatefulWidget {
  const _StockInForm({required this.session});

  final Session session;

  @override
  State<_StockInForm> createState() => _StockInFormState();
}

class _StockInFormState extends State<_StockInForm> {
  final _name = TextEditingController();
  final _category = TextEditingController(text: 'Stationery');
  final _qty = TextEditingController(text: '1');
  final _location = TextEditingController(text: 'Main store');
  bool _busy = false;

  @override
  void dispose() {
    _name.dispose();
    _category.dispose();
    _qty.dispose();
    _location.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final qty = int.tryParse(_qty.text.trim()) ?? 0;
    if (name.isEmpty || qty < 1) {
      showApiError(context, 'Name and a quantity of 1 or more are required');
      return;
    }
    setState(() => _busy = true);
    try {
      await widget.session.api.addStock(
        name: name,
        category: _category.text.trim().isEmpty ? 'General' : _category.text.trim(),
        qty: qty,
        location: _location.text.trim().isEmpty ? 'Main store' : _location.text.trim(),
      );
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
          Text('Stock in', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          TextField(controller: _name, textCapitalization: TextCapitalization.words, decoration: const InputDecoration(labelText: 'Item name')),
          const SizedBox(height: 12),
          TextField(controller: _category, decoration: const InputDecoration(labelText: 'Category')),
          const SizedBox(height: 12),
          TextField(
            controller: _qty,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(labelText: 'Quantity'),
          ),
          const SizedBox(height: 12),
          TextField(controller: _location, decoration: const InputDecoration(labelText: 'Store / location')),
          const SizedBox(height: 16),
          FilledButton(onPressed: _busy ? null : _save, child: Text(_busy ? 'Saving…' : 'Add to stores')),
        ],
      ),
    );
  }
}

class _IssueForm extends StatefulWidget {
  const _IssueForm({required this.session, required this.item});

  final Session session;
  final StockItem item;

  @override
  State<_IssueForm> createState() => _IssueFormState();
}

class _IssueFormState extends State<_IssueForm> {
  final _qty = TextEditingController(text: '1');
  bool _busy = false;

  @override
  void dispose() {
    _qty.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final qty = int.tryParse(_qty.text.trim()) ?? 0;
    if (qty < 1) {
      showApiError(context, 'Quantity must be at least 1');
      return;
    }
    setState(() => _busy = true);
    try {
      await widget.session.api.issueStock(widget.item.id, qty);
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
          Text('Issue — ${widget.item.name}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text('${widget.item.qty} on hand · ${widget.item.location}', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 12),
          TextField(
            controller: _qty,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(labelText: 'Quantity to issue'),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: _busy ? null : _save, child: Text(_busy ? 'Saving…' : 'Issue stock')),
        ],
      ),
    );
  }
}
