import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class PasswordChangeScreen extends StatefulWidget {
  const PasswordChangeScreen({super.key});

  @override
  State<PasswordChangeScreen> createState() => _PasswordChangeScreenState();
}

class _PasswordChangeScreenState extends State<PasswordChangeScreen> {
  final emailController = TextEditingController();
  String error = "";
  bool isLoading = false;

  String buildPath(String route) {
    // Using 10.0.2.2 for Android emulator as per your previous setup
    return "http://10.0.2.2:5555/$route";
  }

  Future<void> handleSubmit() async {
    setState(() {
      isLoading = true;
      error = "";
    });

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/emailpassword")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": emailController.text.trim()}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode != 200) {
        setState(() => error = data['error'] ?? "Something went wrong");
        return;
      }

      // Success -> Show Modal (Dialog)
      if (!mounted) return;
      _showSuccessModal();

    } catch (err) {
      setState(() => error = "Server error");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _showSuccessModal() {
    showDialog(
      context: context,
      barrierDismissible: false, // User must tap the button
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Email Sent",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Text(
                  "An email has been sent to ${emailController.text} to reset your password.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
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
                      Navigator.of(context).pop(); // Close modal
                      Navigator.of(context).pushReplacementNamed('/'); // Go to login
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
    emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // HEADER
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
                    "Change Password",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 24),
                  
                  CustomInput(
                    label: "Email Address",
                    controller: emailController,
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
                          text: "Send Email",
                          onPressed: handleSubmit,
                        ),
                  
                  const SizedBox(height: 16),

                  // Cancel Button
                  SizedBox(
                    width: 100, // Matching the small button size from React
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      onPressed: () => Navigator.pushReplacementNamed(context, '/'),
                      child: const Text("Cancel", style: TextStyle(color: Colors.white)),
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