import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  String message = "";
  bool isLoading = false;

  String buildPath(String route) {
    // 10.0.2.2 is correct for Android Emulators. 
    // For iOS Simulators, use 'localhost' or '127.0.0.1'.
    return "http://10.0.2.2:5000/$route";
  }

  Future<void> handleSubmit() async {
    setState(() {
      isLoading = true;
      message = "";
    });

    final obj = {
      "email": emailController.text.trim(),
      "password": passwordController.text
    };

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/login")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(obj),
      );

      final res = jsonDecode(response.body);

      // Refined logic to match your React requirements precisely
      if (res["error"] != null && res["error"].toString().isNotEmpty) {
        setState(() => message = res["error"]);
      } else if (res["id"] == null || res["id"] <= 0) {
        setState(() => message = "Invalid email or password");
      } else {
        final user = {
          "firstName": res["firstName"],
          "lastName": res["lastName"],
          "id": res["id"]
        };

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("user_data", jsonEncode(user));

        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(context, "/home", (route) => false);
      }
    } catch (err) {
      setState(() => message = "Unable to connect to server");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
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
      child: SingleChildScrollView( // Added to prevent overflow when keyboard appears
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // HEADER - Exact styling from your React branding
            Column(
              children: [
                const Text(
                  "PARCEL PANTRY",
                  style: TextStyle(
                    fontSize: 30, // Slightly larger to match 3xl
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0D47A1), // blue-900
                  ),
                ),
                const Text(
                  "HOUSEHOLD LOGISTICS ENGINE",
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF60A5FA), // blue-400
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),

            CardContainer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  CustomInput(
                    label: "Email",
                    controller: emailController,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    label: "Password",
                    controller: passwordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 24),

                  isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : CustomButton(
                          text: "Login",
                          onPressed: handleSubmit,
                        ),

                  if (message.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      message,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Reset Password Link
                  _buildFooterLink(
                    "Forgot your password?",
                    "Reset Password",
                    "/passwordChange",
                  ),
                  
                  const SizedBox(height: 16),

                  // Signup Link
                  _buildFooterLink(
                    "Don't have an account?",
                    "Sign up",
                    "/signup",
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper method to keep UI code clean and maintain "text-xs text-left"
  Widget _buildFooterLink(String label, String action, String route) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, route),
          child: Text(
            action,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2563EB), // blue-600
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }
}