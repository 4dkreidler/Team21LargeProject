import 'package:flutter/material.dart';
import 'customNavbar.dart';

class Layout extends StatelessWidget {
  final Widget child;

  const Layout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF9FAFB),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(70),
        child: CustomNavbar(),
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