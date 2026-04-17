import 'package:flutter/material.dart';
import 'custom_buildcard.dart';

Widget buildActionCard(String title, String subtitle) {
  return buildCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 16)),
        SizedBox(height: 4),
        Text(subtitle, style: TextStyle(color: Colors.grey)),
      ],
    ),
  );
}