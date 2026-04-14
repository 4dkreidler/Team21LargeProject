import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  
  String error = "";
  bool isLoading = false;

  String buildPath(String route) {
    return "http://10.0.2.2:5555/$route";
  }

  Future<void> handleSubmit(String? id) async {
    setState(() {
      error = "";
    });

    // Validation logic matching React
    if (passwordController.text != confirmController.text) {
      setState(() => error = "Passwords do not match.");
      return;
    }

    if (id == null || id.isEmpty) {
      setState(() => error = "Invalid or missing reset token.");
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/resetpassword/$id")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"newPassword": passwordController.text}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode != 200) {
        setState(() => error = data['error'] ?? "Something went wrong.");
        return;
      }

      // Success -> Show Success Dialog
      if (!mounted) return;
      _showSuccessModal();

    } catch (err) {
      setState(() => error = "Server error. Please try again.");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showSuccessModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Password Updated",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                const Text(
                  "Your password has been successfully changed.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).pushReplacementNamed('/');
                    },
                    child: const Text("Back to Login", style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    passwordController.dispose();
    confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Extract ID from arguments passed during navigation
    final Map? args = ModalRoute.of(context)?.settings.arguments as Map?;
    final String? id = args?['id'];

    return Layout(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // BRANDING
            Column(
              children: [
                const Text(
                  "PARCEL PANTRY",
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0D47A1),
                  ),
                ),
                const Text(
                  "HOUSEHOLD LOGISTICS ENGINE",
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF60A5FA),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            CardContainer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    "Reset Password",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 24),
                  
                  CustomInput(
                    label: "New Password",
                    controller: passwordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  
                  CustomInput(
                    label: "Confirm New Password",
                    controller: confirmController,
                    obscureText: true,
                  ),
                  
                  if (error.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      error,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
                    ),
                  ],
                  
                  const SizedBox(height: 24),

                  isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : CustomButton(
                          text: "Change Password",
                          onPressed: () => handleSubmit(id),
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