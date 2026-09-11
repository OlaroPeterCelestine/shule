import 'package:flutter/material.dart';

import '../models.dart';
import '../theme.dart';

class SchoolBanner extends StatelessWidget {
  const SchoolBanner({super.key, this.school, this.compact = false});

  final SchoolProfile? school;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final name = school?.name ?? 'Little Royals Kindergarten & Primary School';
    final motto = school?.motto ?? 'In God We Trust';
    final term = [school?.term, school?.year].whereType<String>().where((s) => s.isNotEmpty).join(' · ');
    return Container(
      padding: EdgeInsets.fromLTRB(16, compact ? 12 : 18, 16, compact ? 12 : 16),
      decoration: const BoxDecoration(
        color: brandNavy,
        border: Border(bottom: BorderSide(color: brandGold, width: 3)),
      ),
      child: Row(
        children: [
          Container(
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: brandGold,
              borderRadius: BorderRadius.circular(compact ? 10 : 14),
            ),
            child: Text('LR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: compact ? 16 : 20, letterSpacing: 0.4)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: compact ? 13 : 15, height: 1.25)),
                const SizedBox(height: 2),
                Text(motto, style: const TextStyle(color: brandGold, fontSize: 12, fontStyle: FontStyle.italic)),
                if (term.isNotEmpty) Text(term, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
