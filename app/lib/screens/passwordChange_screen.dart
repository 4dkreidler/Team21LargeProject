import 'package:flutter/material.dart';


class PasswordChangeScreen extends StatefulWidget {
  const PasswordChangeScreen({super.key});

  @override
  State<PasswordChangeScreen> createState() =>
      _PasswordChangeScreenState();
}

class _PasswordChangeScreenState extends State<PasswordChangeScreen> {
  final emailController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  String error = "";
  String emailError = "";
  bool showModal = false;

  
  void handleSubmit() {
    setState(() {
      error = "";
      emailError = "";
    });

    final email = emailController.text.trim();
    final newPassword = newPasswordController.text;
    final confirmPassword = confirmPasswordController.text;

    // Password match check
    if (newPassword != confirmPassword) {
      setState(() => error = "Passwords do not match.");
      return;
    }

    try {
      // Fake email validation (same as React)
      final fakeRegisteredEmails = [
        "test@gmail.com",
        "user@email.com"
      ];

      if (!fakeRegisteredEmails.contains(email)) {
        setState(() => emailError = "Email address not registered.");
        return;
      }

      // Success → show modal
      setState(() => showModal = true);
    } catch (e) {
      setState(() => error = "Something went wrong.");
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

 
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Change Password")),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // HEADER
                Column(
                  children: const [
                    Text(
                      "PARCEL PANTRY",
                      style: TextStyle(
                        fontSize: 26,
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

                // FORM CARD
                Card(
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Email Address",
                            style: TextStyle(
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        TextField(
                          controller: emailController,
                          decoration: const InputDecoration(
                            hintText: "Email Address",
                          ),
                        ),

                        // EMAIL ERROR
                        if (emailError.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              emailError,
                              style: const TextStyle(
                                  color: Colors.red, fontSize: 12),
                            ),
                          ),

                        const SizedBox(height: 15),

                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "New Password",
                            style: TextStyle(
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        TextField(
                          controller: newPasswordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            hintText: "New Password",
                          ),
                        ),

                        const SizedBox(height: 15),

                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Confirm New Password",
                            style: TextStyle(
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        TextField(
                          controller: confirmPasswordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            hintText: "Confirm Password",
                          ),
                        ),

                        // GENERAL ERROR
                        if (error.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 10),
                            child: Text(
                              error,
                              style: const TextStyle(
                                  color: Colors.red, fontSize: 12),
                            ),
                          ),

                        const SizedBox(height: 20),

                        // SUBMIT BUTTON
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: handleSubmit,
                            child:
                                const Text("Change Password"),
                          ),
                        ),

                        const SizedBox(height: 10),

                        // CANCEL BUTTON
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                            ),
                            onPressed: () {
                              Navigator.pushNamedAndRemoveUntil(
                                  context, "/", (route) => false);
                            },
                            child: const Text("Cancel"),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          if (showModal)
            Container(
              color: Colors.black54,
              child: Center(
                child: Container(
                  width: 300,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        "Password Updated",
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        "Your password has been successfully changed.",
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pushNamedAndRemoveUntil(
                                context, "/", (route) => false);
                          },
                          child:
                              const Text("Back to Login"),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            )
        ],
      ),
    );
  }
}