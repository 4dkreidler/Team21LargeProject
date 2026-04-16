import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/verification_screen.dart';
import 'screens/successVerification_screen.dart';
import 'screens/passwordChange_screen.dart';
import 'screens/dashboard_screen.dart'; 
import 'screens/setting_screen.dart';
import 'screens/home_screen.dart';

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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),

      // Start the app at the login screen
      initialRoute: '/login',

      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/verification': (context) => const VerificationScreen(),
        '/success-verification': (context) => const SuccessVerificationScreen(),
        'settings': (context) => const SettingsScreen(),
        "/dashboard": (context) => const DashboardScreen(),
        '/home': (context) => const HomeScreen(), 
        '/passwordChange': (context) => const PasswordChangeScreen(),
        
        '/settings': (context) => const SettingsScreen(),
      },
    );
  }
}