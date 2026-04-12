import 'package:flutter/material.dart';
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
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  void handleSubmit() {
    final formData = {
      "firstName": firstNameController.text,
      "lastName": lastNameController.text,
      "username": usernameController.text,
      "email": emailController.text,
      "password": passwordController.text,
    };

    print("Form Data: $formData");

    // simulate React setTimeout
    Future.delayed(const Duration(milliseconds: 500), () {
      Navigator.pushNamed(
        context,
        '/verification',
        arguments: {"email": emailController.text},
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView( 
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 🔷 Title Section (same as React)
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

                  CustomButton(
                    text: "Create Account",
                    onPressed: handleSubmit,
                  ),

                  const SizedBox(height: 15),

                  
                  GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(context, '/login');
                    },
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