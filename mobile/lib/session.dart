import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'access.dart';
import 'api.dart';
import 'models.dart';

const _tokenKey = 'littleroyals.token';
const _userKey = 'littleroyals.user';
const _baseKey = 'littleroyals.api';
const _permsKey = 'littleroyals.perms';

class Session extends ChangeNotifier {
  Session({String? baseUrl, this.token = '', this.user, List<PermRow>? perms})
      : baseUrl = baseUrl ?? defaultApiBase(),
        perms = perms ?? [];

  String baseUrl;
  String token;
  SessionUser? user;
  List<PermRow> perms;

  Api get api => Api(baseUrl: baseUrl, token: token);

  Access get access => Access(role: user?.role ?? '', perms: perms);

  bool get signedIn => token.isNotEmpty && user != null;

  static Session empty() => Session();

  static Future<Session> load() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey) ?? '';
    final base = prefs.getString(_baseKey);
    SessionUser? user;
    final raw = prefs.getString(_userKey);
    if (raw != null) {
      try {
        user = SessionUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {}
    }
    final session = Session(baseUrl: base, token: token, user: user, perms: _readPerms(prefs.getString(_permsKey)));
    if (session.signedIn) {
      await session.refreshPerms();
    }
    return session;
  }

  Future<void> applyLogin(String nextBase, Map<String, dynamic> payload) async {
    baseUrl = nextBase.replaceAll(RegExp(r'\/+$'), '');
    token = payload['token'] as String? ?? '';
    final rawUser = payload['user'];
    user = rawUser is Map<String, dynamic> ? SessionUser.fromJson(rawUser) : null;
    perms = _parsePerms(payload['perms']);
    await _persist();
    if (perms.isEmpty) await refreshPerms();
    notifyListeners();
  }

  Future<void> refreshPerms() async {
    if (token.isEmpty) return;
    try {
      final me = await api.me();
      final rawUser = me['user'];
      if (rawUser is Map<String, dynamic>) user = SessionUser.fromJson(rawUser);
      final next = _parsePerms(me['perms']);
      if (next.isNotEmpty) {
        perms = next;
      } else {
        final all = await api.perms();
        final role = user?.role ?? '';
        perms = role.isEmpty ? all : all.where((p) => p.role == role).toList();
      }
      await _persist();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> signOut() async {
    token = '';
    user = null;
    perms = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_permsKey);
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_baseKey, baseUrl);
    await prefs.setString(_tokenKey, token);
    if (user != null) {
      await prefs.setString(_userKey, jsonEncode(user!.toJson()));
    }
    await prefs.setString(_permsKey, jsonEncode(perms.map((p) => p.toJson()).toList()));
  }
}

List<PermRow> _parsePerms(dynamic raw) {
  if (raw is! List) return [];
  return raw.whereType<Map<String, dynamic>>().map(PermRow.fromJson).toList();
}

List<PermRow> _readPerms(String? raw) {
  if (raw == null || raw.isEmpty) return [];
  try {
    return _parsePerms(jsonDecode(raw));
  } catch (_) {
    return [];
  }
}
