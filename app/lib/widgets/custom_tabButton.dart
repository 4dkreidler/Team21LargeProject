import 'package:flutter/material.dart';

class TabButton extends StatelessWidget {
  final String label;
  final String value;
  final String currentValue;
  final Function(String) onTap;

  const TabButton({
    super.key,
    required this.label,
    required this.value,
    required this.currentValue,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = currentValue == value;

    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        decoration: BoxDecoration(
          color: isActive ? Colors.blue : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}