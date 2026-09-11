import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:teacher_app/main.dart';
import 'package:teacher_app/session.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('shows teacher sign in', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(TeacherApp(session: Session.empty()));
    expect(find.text('Kindergarten & Primary'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
  });
}
