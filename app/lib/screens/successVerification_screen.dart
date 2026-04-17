import 'package:flutter/material.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';

class SuccessVerificationScreen extends StatelessWidget {
  const SuccessVerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CardContainer(
            child: Column(
              children: [
                const Text(
                  "✔",
                  style: TextStyle(
                    fontSize: 48,
                    color: Colors.green,
                  ),
                ),

                const SizedBox(height: 10),

                const Text(
                  "Account Verified!",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),

                const SizedBox(height: 10),

                const Text(
                  "Your account has been successfully verified.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),

                const SizedBox(height: 20),

                CustomButton(
                  text: "Go to Login",
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(
                        context, "/login", (Route<dynamic> route) => false);
                  },
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}