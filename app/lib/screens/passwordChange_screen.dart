import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../widgets/layout.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/card_container.dart';

class PasswordChangeScreen extends StatefulWidget {
  const PasswordChangeScreen({super.key});

  @override
  State<PasswordChangeScreen> createState() => _PasswordChangeScreenState();
}

class _PasswordChangeScreenState extends State<PasswordChangeScreen> {
  final TextEditingController _emailController = TextEditingController();
  
  String _error = "";
  bool _isLoading = false;

  // Consistent with your previous working builds
  String buildPath(String route) => "http://localhost:5555/$route";

  Future<void> _handleSubmit() async {
    final email = _emailController.text.trim();

    if (email.isEmpty) {
      setState(() => _error = "Please enter your email address");
      return;
    }

    setState(() {
      _isLoading = true;
      _error = "";
    });

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/emailpassword")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode != 200 && response.statusCode != 201) {
        setState(() => _error = data['error'] ?? "Something went wrong");
        return;
      }

      // Success: Show the Modal
      if (!mounted) return;
      _showSuccessModal(email);

    } catch (err) {
      debugPrint("Reset Error: $err");
      setState(() => _error = "Server error. Is the backend running?");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessModal(String email) {
    showDialog(
      context: context,
      barrierDismissible: false, // User must click the button
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text(
          "Email Sent",
          textAlign: TextAlign.center,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "An email has been sent to $email to reset your password.",
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[600],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text("Back to Login"),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView(
        child: Column(
          children: [
            // HEADER
            Column(
              children: const [
                Text(
                  "PARCEL PANTRY",
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0D47A1),
                  ),
                ),
                Text(
                  "HOUSEHOLD LOGISTICS ENGINE",
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF60A5FA),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // FORM CARD
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Change Password",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),
                CardContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CustomInput(
                        label: "Email Address",
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      if (_error.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          _error,
                          style: const TextStyle(color: Colors.red, fontSize: 13),
                        ),
                      ],
                      const SizedBox(height: 24),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : CustomButton(
                              text: "Send Email",
                              onPressed: _handleSubmit,
                            ),
                      const SizedBox(height: 16),
                      
                      // CANCEL BUTTON
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton(
                          onPressed: () => Navigator.pop(context),
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.red[500],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          ),
                          child: const Text("Cancel", style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}