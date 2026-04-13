import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/verification_screen.dart';
import 'screens/home_screen.dart';
import 'screens/successVerification_screen.dart';
import 'screens/passwordChange_screen.dart';

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
        primarySwatch: Colors.blue,
      ),

      initialRoute: '/login',

      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/verification': (context) => const VerificationScreen(),
        '/home': (context) => const HomeScreen(), // optional for now
        '/success-verification': (context) => const SuccessVerificationScreen(),
        "/passwordChange": (context) => const PasswordChangeScreen(),

      },
    );
  }
}
