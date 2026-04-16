import 'package:flutter/material.dart';
//import 'customNavbar.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Layout extends StatelessWidget {
  final Widget child;

  const Layout({super.key, required this.child});
  Future<void> logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("user_data");

    if (!context.mounted) return;

    Navigator.pushNamedAndRemoveUntil(context, "/login", (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF9FAFB),
      appBar: AppBar(
        title: GestureDetector(
          onTap: () {
            Navigator.pushNamedAndRemoveUntil(
                context, "/home", (_) => false);
          },
          child: const Text("ParcelPantry"),
        ),
      actions: [
          TextButton(
            onPressed: () {
              Navigator.pushNamed(context, "/settings");
            },
            child: const Text("A", style: TextStyle(color: Colors.green)),
          ),
          TextButton(
            onPressed: () => logout(context),
            child: const Text("Logout",
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 1200),
        child: Padding(
          padding: EdgeInsets.all(24),
          child: child, // page content
        ),
      ),
    ),
  );
  }
}