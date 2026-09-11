import 'package:flutter/material.dart';

import '../api.dart';
import '../session.dart';
import '../theme.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, required this.session});

  final Session session;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late final TextEditingController _email;
  late final TextEditingController _password;
  late final TextEditingController _base;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _email = TextEditingController(text: 'teacher@littleroyals.ac.ug');
    _password = TextEditingController(text: 'teach');
    _base = TextEditingController(text: widget.session.baseUrl);
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _base.dispose();
    super.dispose();
  }

  static const _demos = [
    ('admin', 'Admin'),
    ('teacher', 'Teacher'),
    ('accountant', 'Accounts'),
    ('parent', 'Parent'),
    ('nurse', 'Nurse'),
    ('registrar', 'Registrar'),
  ];

  Future<void> _submit({String? demo}) async {
    setState(() => _busy = true);
    try {
      final api = Api(baseUrl: _base.text.trim());
      final payload = demo != null
          ? await api.demo(demo)
          : await api.login(_email.text.trim(), _password.text);
      await widget.session.applyLogin(_base.text.trim(), payload);
    } catch (error) {
      if (mounted) showApiError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
          children: [
            Container(
              width: 56,
              height: 56,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: brandGold, borderRadius: BorderRadius.circular(14)),
              child: const Text('LR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20)),
            ),
            const SizedBox(height: 16),
            Text('LITTLE ROYALS', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: brandGreen, letterSpacing: 1.4, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Kindergarten & Primary', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: brandNavy, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('In God We Trust', style: TextStyle(color: brandGold, fontStyle: FontStyle.italic)),
            const SizedBox(height: 8),
            Text(
              'The screens you see follow your school role — same permissions as the web OS. Seguku, Kampala.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: brandNavy.withValues(alpha: 0.7)),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password (4+ characters)'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _base,
              autocorrect: false,
              decoration: const InputDecoration(
                labelText: 'API base URL',
                helperText: 'Android emulator 10.0.2.2 · iOS sim 127.0.0.1 · phone = your computer LAN IP',
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _busy ? null : () => _submit(),
              child: Text(_busy ? 'Signing in…' : 'Sign in'),
            ),
            const SizedBox(height: 20),
            Text('Open a demo role', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: brandNavy)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final demo in _demos)
                  OutlinedButton(
                    onPressed: _busy ? null : () => _submit(demo: demo.$1),
                    child: Text(demo.$2),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
