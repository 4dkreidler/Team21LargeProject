import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/verification_screen.dart';
import 'screens/successVerification_screen.dart';
import 'screens/passwordChange_screen.dart';
// New Imports
import 'screens/dashboard_screen.dart'; 
import 'screens/setting_screen.dart';

void main() {
  runApp(const ParcelPantryApp());
}

class ParcelPantryApp extends StatelessWidget {
  const ParcelPantryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Parcel Pantry',
      theme: ThemeData(
        // Tip: Using colorScheme is the modern way to set themes in Flutter 3
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),

      initialRoute: '/login',

      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/verification': (context) => const VerificationScreen(),
        '/success-verification': (context) => const SuccessVerificationScreen(),
        '/password-change': (context) => const PasswordChangeScreen(),
        
        // Dashboard & Settings
        '/dashboard': (context) => const DashboardScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
    );
  }
}