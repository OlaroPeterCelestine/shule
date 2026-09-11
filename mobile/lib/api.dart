import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import 'models.dart';

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class Api {
  Api({required this.baseUrl, this.token = ''});

  String baseUrl;
  String token;

  Uri _uri(String path, [Map<String, String>? query]) {
    final root = baseUrl.replaceAll(RegExp(r'/+$'), '');
    final rel = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$root$rel').replace(queryParameters: query);
  }

  Map<String, String> _headers({bool jsonBody = false, String accept = 'application/json'}) {
    return {
      'Accept': accept,
      if (jsonBody) 'Content-Type': 'application/json',
      if (token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> _send(String method, String path, {Object? body, Map<String, String>? query}) async {
    final uri = _uri(path, query);
    final headers = _headers(jsonBody: body != null);
    final encoded = body == null ? null : jsonEncode(body);
    late http.Response res;
    try {
      switch (method) {
        case 'POST':
          res = await http.post(uri, headers: headers, body: encoded);
        case 'PATCH':
          res = await http.patch(uri, headers: headers, body: encoded);
        default:
          res = await http.get(uri, headers: headers);
      }
    } on SocketException {
      throw ApiException('Cannot reach the school API at $baseUrl');
    } on http.ClientException {
      throw ApiException('Cannot reach the school API at $baseUrl');
    }

    final data = _decode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(_message(data, res.reasonPhrase ?? 'Request failed'));
    }
    return data;
  }

  dynamic _decode(String body) {
    if (body.isEmpty) return <String, dynamic>{};
    try {
      return jsonDecode(body);
    } catch (_) {
      return <String, dynamic>{};
    }
  }

  String _message(dynamic data, String fallback) {
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is List) return message.join(', ');
      if (message is String && message.isNotEmpty) return message;
    }
    return fallback;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _send('POST', '/auth/login', body: {'email': email, 'password': password});
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> demo(String role) async {
    final data = await _send('POST', '/auth/demo', body: {'role': role});
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> me() async {
    final data = await _send('GET', '/auth/me');
    return data as Map<String, dynamic>;
  }

  Future<List<PermRow>> perms() async {
    final data = await _send('GET', '/perms');
    return (data as List).whereType<Map<String, dynamic>>().map(PermRow.fromJson).toList();
  }

  Future<SchoolProfile> school() async {
    final data = await _send('GET', '/school');
    return SchoolProfile.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Student>> students() async {
    final data = await _send('GET', '/students');
    return (data as List).whereType<Map<String, dynamic>>().map(Student.fromJson).toList();
  }

  Future<List<RegisterRow>> register() async {
    final data = await _send('GET', '/attendance');
    return (data as List).whereType<Map<String, dynamic>>().map(RegisterRow.fromJson).toList();
  }

  Future<RegisterRow> mark(String adm, String status) async {
    final data = await _send('PATCH', '/attendance/$adm', body: {'status': status});
    return RegisterRow.fromJson(data as Map<String, dynamic>);
  }

  Future<List<RegisterRow>> markBulk(String status, [String? cls]) async {
    final data = await _send('POST', '/attendance/bulk', body: { 'status': status, if (cls != null && cls.isNotEmpty) 'cls': cls });
    return (data as List).whereType<Map<String, dynamic>>().map(RegisterRow.fromJson).toList();
  }

  Future<List<ExamPaper>> exams() async {
    final data = await _send('GET', '/exams');
    return (data as List).whereType<Map<String, dynamic>>().map(ExamPaper.fromJson).toList();
  }

  Future<ClockMine> myClock() async {
    final data = await _send('GET', '/clock/me');
    return ClockMine.fromJson(data as Map<String, dynamic>);
  }

  Future<ClockPunch> clockIn() async {
    final data = await _send('POST', '/clock/in', body: <String, dynamic>{});
    return ClockPunch.fromJson(data as Map<String, dynamic>);
  }

  Future<ClockPunch> clockOut() async {
    final data = await _send('POST', '/clock/out', body: <String, dynamic>{});
    return ClockPunch.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Visit>> visits() async {
    final data = await _send('GET', '/health');
    return (data as List).whereType<Map<String, dynamic>>().map(Visit.fromJson).toList();
  }

  Future<Visit> addVisit({required String adm, required String reason, required String action}) async {
    final data = await _send('POST', '/health', body: {'adm': adm, 'reason': reason, 'action': action});
    return Visit.fromJson(data as Map<String, dynamic>);
  }

  Future<List<StockItem>> stock() async {
    final data = await _send('GET', '/inventory');
    return (data as List).whereType<Map<String, dynamic>>().map(StockItem.fromJson).toList();
  }

  Future<StockItem> addStock({required String name, required String category, required int qty, required String location}) async {
    final data = await _send('POST', '/inventory', body: {'name': name, 'category': category, 'qty': qty, 'location': location});
    return StockItem.fromJson(data as Map<String, dynamic>);
  }

  Future<StockItem> issueStock(int id, int qty) async {
    final data = await _send('PATCH', '/inventory/$id', body: {'qty': qty});
    return StockItem.fromJson(data as Map<String, dynamic>);
  }

  Future<List<SchoolEvent>> events() async {
    final data = await _send('GET', '/calendar');
    return (data as List).whereType<Map<String, dynamic>>().map(SchoolEvent.fromJson).toList();
  }

  Future<List<ReportCard>> reportCards() async {
    final data = await _send('GET', '/reports/cards');
    return (data as List).whereType<Map<String, dynamic>>().map(ReportCard.fromJson).toList();
  }

  Future<File> reportCardPdf(String adm) async {
    final uri = _uri('/documents/report-card/pdf', {'adm': adm, 'download': '1'});
    late http.Response res;
    try {
      res = await http.get(uri, headers: _headers(accept: 'application/pdf'));
    } on SocketException {
      throw ApiException('Cannot reach the school API at $baseUrl');
    }
    if (res.statusCode >= 400) {
      throw ApiException(_message(_decode(res.body), 'Could not generate the PDF'));
    }
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/report-card-$adm.pdf');
    await file.writeAsBytes(res.bodyBytes, flush: true);
    return file;
  }
}

String defaultApiBase() {
  if (Platform.isAndroid) return 'http://10.0.2.2:3000/api';
  return 'http://127.0.0.1:3000/api';
}
