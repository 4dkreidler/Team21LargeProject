import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/card_container.dart';
import '../widgets/layout.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  // Controllers to retrieve text from inputs
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool _isLoading = false;

  // Function to handle the API call (Matches your React logic)
  Future<void> handleSubmit() async {
    // 1. Show loading indicator
    setState(() => _isLoading = true);

    // 2. Define the endpoint (Using your DigitalOcean IP)
    const String url = "http://159.203.105.19:5000/api/register";

    // 3. Prepare the payload (Matches 'obj' in your React code)
    final Map<String, dynamic> signupData = {
      "firstName": firstNameController.text.trim(),
      "lastName": lastNameController.text.trim(),
      "email": emailController.text.trim(),
      "password": passwordController.text,
      // Note: Add "username" if your backend expects it
    };

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(signupData),
      );

      final res = jsonDecode(response.body);

      // 4. Handle Response
      if (response.statusCode == 200) {
        // Check for custom error field in JSON (matching your React check: res.error !== "")
        if (res['error'] != null && res['error'].toString().isNotEmpty) {
          _showError(res['error']);
        } else {
          // Success: Navigate to verification
          if (!mounted) return;
          Navigator.pushNamed(
            context,
            '/verification',
            arguments: {"email": emailController.text},
          );
        }
      } else {
        _showError("Server error: ${response.statusCode}");
      }
    } catch (err) {
      _showError("Connection failed. Please check your internet.");
      print("Signup Error: $err");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  @override
  void dispose() {
    // Clean up controllers when the widget is removed
    firstNameController.dispose();
    lastNameController.dispose();
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView(
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

            const SizedBox(height: 25),

            // 🧾 Card Form
            CardContainer(
              child: Column(
                children: [
                  CustomInput(
                    label: "First Name",
                    controller: firstNameController,
                  ),
                  const SizedBox(height: 10),
                  CustomInput(
                    label: "Last Name",
                    controller: lastNameController,
                  ),
                  const SizedBox(height: 10),
                  CustomInput(
                    label: "Username",
                    controller: usernameController,
                  ),
                  const SizedBox(height: 10),
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

                  // Show spinner or button
                  _isLoading
                      ? const CircularProgressIndicator()
                      : CustomButton(
                          text: "Create Account",
                          onPressed: handleSubmit,
                        ),

                  const SizedBox(height: 15),

                  // 🔗 Login redirect
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/login'),
                    child: const Text(
                      "Already have an account?\nLogin",
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