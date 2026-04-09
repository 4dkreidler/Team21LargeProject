import 'package:flutter/material.dart';
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

  void handleLogin() {
    print("Attempting login for: ${emailController.text}");

    // Navigate to home (same as React navigate("/home"))
    Navigator.pushNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 🔷 Title Section (matches React)
          Column(
            children: const [
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

          // 🧾 Card (matches React Card)
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

                CustomButton(
                  text: "Login",
                  onPressed: handleLogin,
                ),

                const SizedBox(height: 15),

                // 🔗 Signup link (React <a href="/signup">)
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