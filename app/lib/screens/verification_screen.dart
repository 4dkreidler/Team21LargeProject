import 'package:flutter/material.dart';
import '../widgets/card_container.dart';
import '../widgets/layout.dart';
import '../widgets/custom_button.dart';

class VerificationScreen extends StatelessWidget {
  const VerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // دریافت email از navigation arguments
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

    final email = args?['email'] ?? "your email";

    return Layout(
      child: CardContainer(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 📩 Image (make sure you add it in assets)
            Image.asset(
              'assets/envelope.png',
              width: 120,
              height: 120,
            ),

            const SizedBox(height: 20),

            const Text(
              "Verify your email address",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 10),

            Text(
              "You've entered $email as the email address for your account.\nPlease verify this address by clicking the button below.",
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),

            const SizedBox(height: 20),

            CustomButton(
              text: "Verify your email",
              onPressed: () {
                print("Verification button clicked");
                // later → call backend API
              },
            ),
          ],
        ),
      ),
    );
  }
}