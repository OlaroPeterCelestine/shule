import 'package:flutter/material.dart';

import 'screens/login_page.dart';
import 'screens/shell.dart';
import 'session.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final session = await Session.load();
  runApp(TeacherApp(session: session));
}

class TeacherApp extends StatelessWidget {
  const TeacherApp({super.key, required this.session});

  final Session session;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: session,
      builder: (context, _) {
        return MaterialApp(
          title: 'Little Royals',
          debugShowCheckedModeBanner: false,
          theme: teacherTheme(),
          home: session.signedIn ? TeacherShell(session: session) : LoginPage(session: session),
        );
      },
    );
  }
}
