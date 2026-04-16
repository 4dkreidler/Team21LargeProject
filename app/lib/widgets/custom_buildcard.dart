import 'package:flutter/material.dart';

Widget buildCard({required Widget child}) {
  return Container(
    padding: EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: Colors.grey.shade200),
      boxShadow: [
        BoxShadow(color: Colors.black12, blurRadius: 6)
      ],
    ),
    child: child,
  );
}