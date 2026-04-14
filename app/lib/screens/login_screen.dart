import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/layout.dart';
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _message = "";

  // Helper to mimic your React buildPath utility
  String buildPath(String endpoint) {
    return "https://your-api-url.com/$endpoint";
  }

  Future<void> _handleSubmit() async {
    setState(() => _message = "");

    final Map<String, String> loginData = {
      "email": _emailController.text,
      "password": _passwordController.text,
    };

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/login")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(loginData),
      );

      final res = jsonDecode(response.body);

      if (res['error'] != null && res['error'].isNotEmpty) {
        setState(() => _message = res['error']);
      } else if (res['id'] <= 0) {
        setState(() => _message = "Invalid email or password");
      } else {
        final prefs = await SharedPreferences.getInstance();
        final userData = jsonEncode({
          "firstName": res['firstName'],
          "lastName": res['lastName'],
          "id": res['id'],
        });
        await prefs.setString("user_data", userData);

        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (err) {
      setState(() => _message = "Unable to connect to server");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Section
          Column(
            children: [
              const Text(
                "PARCEL PANTRY",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0D47A1),
                ),
              ),
              const Text(
                "HOUSEHOLD LOGISTICS ENGINE",
                style: TextStyle(
                  fontSize: 10,
                  letterSpacing: 2,
                  color: Colors.blueAccent,
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
                  controller: _emailController,
                ),
                const SizedBox(height: 16),
                CustomInput(
                  label: "Password",
                  controller: _passwordController,
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: "Login",
                  onPressed: _handleSubmit,
                ),
                
                if (_message.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(
                      _message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
                    ),
                  ),
                
                const SizedBox(height: 20),
                _buildLinkSection(
                  "Forgot your password?",
                  "Reset Password",
                  () => Navigator.pushNamed(context, '/passwordChange'),
                ),
                const SizedBox(height: 16),
                _buildLinkSection(
                  "Don't have an account?",
                  "Sign up",
                  () => Navigator.pushNamed(context, '/signup'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLinkSection(String text, String linkText, VoidCallback onTap) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(text, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        GestureDetector(
          onTap: onTap,
          child: Text(
            linkText,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1976D2),
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }
}