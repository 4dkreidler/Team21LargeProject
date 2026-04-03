import 'package:flutter/material.dart';
import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../services/api_service.dart';

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
    if (emailController.text.isEmpty || passwordController.text.isEmpty) {
      _showError("Please enter both email and password.");
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Use the logic from ApiService
      bool success = await ApiService.login(
        emailController.text.trim(),
        passwordController.text,
      );

      if (success) {
        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
      } else {
        _showError("Invalid login credentials.");
      }
    } catch (err) {
      _showError("Connection failed. Please check your internet.");
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
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView(
        child: Column(
          children: [
            const Text("PARCEL PANTRY", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.blue)),
            const SizedBox(height: 30),
            CardContainer(
              child: Column(
                children: [
                  CustomInput(label: "Email", controller: emailController),
                  const SizedBox(height: 10),
                  CustomInput(label: "Password", controller: passwordController, obscureText: true),
                  const SizedBox(height: 20),
                  _isLoading 
                    ? const CircularProgressIndicator() 
                    : CustomButton(text: "Login", onPressed: handleLogin),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}