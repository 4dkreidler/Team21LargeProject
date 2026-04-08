import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
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
  
  bool _isLoading = false;

  Future<void> handleLogin() async {
    setState(() => _isLoading = true);
    const String url = "http://159.203.105.19:5000/api/login";

    final Map<String, String> loginData = {
      "email": emailController.text.trim(),
      "password": passwordController.text,
    };

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(loginData),
      );

      if (response.statusCode == 200) {
        final res = jsonDecode(response.body);

        // Matches React logic: if (res.id <= 0) alert("Invalid login")
        if (res['id'] != null && res['id'] > 0) {
          print("Logged in: $res");
          if (!mounted) return;
          
          // Clear stack and go home (prevents going back to login)
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        } else {
          _showError("Invalid login. Please check your credentials.");
        }
      } else {
        _showError("Server error: ${response.statusCode}");
      }
    } catch (err) {
      print("Login Error: $err");
      _showError("Could not connect to the server.");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 🔷 Title Section
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

          // 🧾 Card
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

                // 🔗 Signup link
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
    );
  }
}