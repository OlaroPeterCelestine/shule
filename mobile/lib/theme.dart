import 'package:flutter/material.dart';

import 'api.dart';

const brandGreen = Color(0xFF0E7C61);
const brandNavy = Color(0xFF14213D);
const brandGold = Color(0xFFC68A1A);
const brandMaroon = Color(0xFF8A2E3B);
const brandPaper = Color(0xFFF4F6F8);

const schoolClasses = [
  'Baby class',
  'Middle class',
  'Top class',
  'Primary One',
  'Primary Two',
  'Primary Three',
  'Primary Four',
  'Primary Five',
  'Primary Six',
  'Primary Seven',
];

const markColors = {
  'P': brandGreen,
  'A': brandMaroon,
  'L': brandGold,
  'E': brandNavy,
};

ThemeData teacherTheme() {
  final scheme = ColorScheme.fromSeed(seedColor: brandGreen, primary: brandGreen, surface: Colors.white);
  return ThemeData(
    colorScheme: scheme,
    useMaterial3: true,
    scaffoldBackgroundColor: brandPaper,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: brandNavy,
      elevation: 0,
      scrolledUnderElevation: 0.5,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFD6D9D0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: brandGreen, width: 2),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: brandGreen,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: brandGreen.withValues(alpha: 0.12),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return TextStyle(fontSize: 12, fontWeight: selected ? FontWeight.w600 : FontWeight.w500, color: brandNavy);
      }),
    ),
  );
}

void showApiError(BuildContext context, Object error) {
  final text = error is ApiException ? error.message : error.toString();
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
}
