import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  String message = "";
  bool isLoading = false;

  String buildPath(String route) {
    
    return "http://10.0.2.2:5000/$route";
  }

  Future<void> handleSubmit() async {
    setState(() {
      isLoading = true;
      message = "";
    });

    final obj = {
      "firstName": firstNameController.text.trim(),
      "lastName": lastNameController.text.trim(),
      "email": emailController.text.trim(),
      "password": passwordController.text,
    };

    try {
      final response = await http.post(
        Uri.parse(buildPath('api/register')),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(obj),
      );

      final res = jsonDecode(response.body);

      if (res["error"] != null && res["error"].toString().isNotEmpty) {
        setState(() => message = res["error"]);
      } else {
       
        if (!mounted) return;
        Navigator.pushNamed(
          context,
          '/verification',
          arguments: {"email": emailController.text.trim()},
        );
      }
    } catch (err) {
      setState(() => message = "Unable to connect to server");
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
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
            
            Column(
              children: [
                const Text(
                  "PARCEL PANTRY",
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0D47A1), // blue-900
                  ),
                ),
                const Text(
                  "HOUSEHOLD LOGISTICS ENGINE",
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF60A5FA), // blue-400
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            CardContainer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  CustomInput(
                    label: "First Name",
                    controller: firstNameController,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    label: "Last Name",
                    controller: lastNameController,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    label: "Email",
                    controller: emailController,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    label: "Password",
                    controller: passwordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 24),

                  isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : CustomButton(
                          text: "Create Account",
                          onPressed: handleSubmit,
                        ),

                  if (message.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Login Redirect (Styled to match React text-[10px])
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Already have an account?",
                          style: TextStyle(fontSize: 10, color: Colors.grey),
                        ),
                        GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/login'),
                          child: const Text(
                            "Login",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
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