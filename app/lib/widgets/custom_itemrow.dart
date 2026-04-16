import 'package:flutter/material.dart';

Widget buildItem(String name, int qty) {
  Color bg;
  Color text;

  if (qty == 0) {
    bg = Color(0xFFFEE2E2);
    text = Color(0xFFB91C1C);
  } else if (qty < 5) {
    bg = Color(0xFFFEF3C7);
    text = Color(0xFF92400E);
  } else {
    bg = Color(0xFFD1FAE5);
    text = Color(0xFF065F46);
  }

  return Container(
    padding: EdgeInsets.all(16),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name,
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16)),
            Text("GENERAL",
                style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey)),
          ],
        ),

        Row(
          children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                qty == 0 ? "OUT" : "QTY: $qty",
                style: TextStyle(color: text, fontWeight: FontWeight.bold),
              ),
            ),

            SizedBox(width: 10),

            Icon(Icons.edit, color: Colors.grey),
            SizedBox(width: 10),
            Icon(Icons.delete, color: Colors.red),
          ],
        )
      ],
    ),
  );
}