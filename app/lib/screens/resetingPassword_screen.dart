import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../widgets/layout.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/card_container.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? resetToken; // This replaces the useParams() id

  const ResetPasswordScreen({super.key, this.resetToken});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();
  
  String _error = "";
  bool _isLoading = false;

  String buildPath(String route) {
  return "http://172.20.10.2:5555/$route"; 
}

  Future<void> _handleSubmit() async {
    final password = _passwordController.text;
    final confirm = _confirmController.text;
    final token = widget.resetToken;

    setState(() => _error = "");

    // Logic matching your React code
    if (password != confirm) {
      setState(() => _error = "Passwords do not match.");
      return;
    }

    if (token == null || token.isEmpty) {
      setState(() => _error = "Invalid or missing reset token.");
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/resetpassword/$token")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"newPassword": password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode != 200 && response.statusCode != 201) {
        setState(() => _error = data['error'] ?? "Something went wrong.");
        return;
      }

      // Success: Show Modal
      if (!mounted) return;
      _showSuccessModal();

    } catch (err) {
      debugPrint("Reset Error: $err");
      setState(() => _error = "Server error. Please try again.");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text("Password Updated", textAlign: TextAlign.center),
        content: const Text(
          "Your password has been successfully changed.",
          textAlign: TextAlign.center,
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[600],
                foregroundColor: Colors.white,
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
            // Header
            const Text(
              "PARCEL PANTRY",
              style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1)),
            ),
            const Text(
              "HOUSEHOLD LOGISTICS ENGINE",
              style: TextStyle(fontSize: 10, letterSpacing: 2.5, color: Color(0xFF60A5FA)),
            ),
            const SizedBox(height: 32),

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Reset Password",
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                CardContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CustomInput(
                        label: "New Password",
                        controller: _passwordController,
                        obscureText: true,
                      ),
                      const SizedBox(height: 16),
                      CustomInput(
                        label: "Confirm New Password",
                        controller: _confirmController,
                        obscureText: true,
                      ),
                      if (_error.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(_error, style: const TextStyle(color: Colors.red, fontSize: 13)),
                      ],
                      const SizedBox(height: 24),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : CustomButton(text: "Change Password", onPressed: _handleSubmit),
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