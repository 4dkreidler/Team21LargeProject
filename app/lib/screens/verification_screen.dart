import 'package:flutter/material.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';

class VerificationScreen extends StatelessWidget {
  const VerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    final email = args?["email"] ?? "your email";

    return Layout(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CardContainer(
            child: Column(
              children: [
                // IMAGE (make sure you add it to assets)
                Image.asset(
                  "assets/envelope.png",
                  width: 140,
                  height: 140,
                ),

                const SizedBox(height: 16),

                const Text(
                  "Verify your email address",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12),

                Text(
                  "We've sent a verification link to\n$email\n\nPlease check your inbox and click the link.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
