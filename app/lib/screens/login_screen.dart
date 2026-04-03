import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../services/api_service.dart'; // Recommended to move logic here later

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  
  bool _isLoading = false;

  Future<void> handleLogin() async {
    // 1. Basic validation to prevent empty requests
    if (emailController.text.isEmpty || passwordController.text.isEmpty) {
      _showError("Please enter both email and password.");
      return;
    }

    setState(() => _isLoading = true);

    // 2. Updated URL to include /api prefix from your server.js logic
    const String url = "http://159.203.105.19:5000/api/login";

    final Map<String, String> loginData = {
      "email": emailController.text.trim(), // Server expects 'email'
      "password": passwordController.text,
    };

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(loginData),
      );

      print('Server Response Status: ${response.statusCode}'); //
      print('Server Response Body: ${response.body}'); //

      if (response.statusCode == 200) {
        final res = jsonDecode(response.body);

        // 3. FIX: Check for a non-empty String ID instead of > 0
        // Your server returns: {"id":"69cf9f36...", ...}
        if (res['id'] != null && res['id'].toString().isNotEmpty) {
          if (!mounted) return;
          
          // Clear stack and go home
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        } else {
          _showError("Invalid login credentials.");
        }
      } else if (response.statusCode == 404) {
        _showError("Login endpoint not found. Check /api prefix.");
      } else {
        _showError("Login failed. Please try again.");
      }
    } catch (err) {
      print("Login Error: $err");
      _showError("Connection failed: Ensure you have network permissions.");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView( // Added to prevent overflow on small screens
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Column(
              children: [
                Text(
                  "PARCEL PANTRY",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  "Household Logistics Engine",
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2,
                    color: Colors.blueGrey,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            CardContainer(
              child: Column(
                children: [
                  CustomInput(
                    label: "Email",
                    controller: emailController,
                  ),
                  const SizedBox(height: 10),
                  CustomInput(
                    label: "Password",
                    controller: passwordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 20),
                  _isLoading
                      ? const CircularProgressIndicator()
                      : CustomButton(
                          text: "Login",
                          onPressed: handleLogin,
                        ),
                  const SizedBox(height: 15),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(context, '/signup');
                    },
                    child: const Text(
                      "Don't have an account?\nSign up",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        decoration: TextDecoration.underline,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}