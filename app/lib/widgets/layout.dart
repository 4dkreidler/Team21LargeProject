import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // For user data storage

class Layout extends StatelessWidget {
  final Widget child;

  const Layout({super.key, required this.child});

  Future<Map<String, dynamic>?> _getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString("user_data");
    if (stored == null) return null;
    return jsonDecode(stored);
  }

  Future<void> logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("user_data");

    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, "/login", (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _getUserData(),
      builder: (context, snapshot) {
        final userData = snapshot.data;
        final initial = (userData?["firstName"] ?? "")
            .toString()
            .isNotEmpty
            ? userData!["firstName"].toString()[0].toUpperCase()
            : "?";

        return Scaffold(
          backgroundColor: const Color(0xFFF9FAFB),
          appBar: AppBar(
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white,
            elevation: 1,
            shadowColor: Colors.black12,
            automaticallyImplyLeading: false,
            title: GestureDetector(
              onTap: () {
                final route = userData != null ? "/home" : "/login";
                Navigator.pushNamedAndRemoveUntil(
                    context, route, (_) => false);
              },
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // PP logo
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Text("PP",
                          style: TextStyle(
                              color: Color(0xFF2563EB),
                              fontWeight: FontWeight.bold,
                              fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text("ParcelPantry",
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E3A8A),
                          fontSize: 18)),
                ],
              ),
            ),
            actions: [
              // Profile initial circle → settings
              GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, "/settings");
                },
                child: Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFDBEAFE),
                    shape: BoxShape.circle,
                    border:
                        Border.all(color: const Color(0xFFBFDBFE), width: 1.5),
                  ),
                  child: Center(
                    child: Text(initial,
                        style: const TextStyle(
                            color: Color(0xFF1D4ED8),
                            fontWeight: FontWeight.w900,
                            fontSize: 14)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Logout button
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: TextButton(
                  onPressed: () => logout(context),
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFFF3F4F6),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("Logout",
                      style: TextStyle(
                          color: Color(0xFF374151),
                          fontWeight: FontWeight.bold,
                          fontSize: 12)),
                ),
              ),
            ],
          ),
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: child,
              ),
            ),
          ),
        );
      },
    );
  }
}
