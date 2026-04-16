import 'package:flutter/material.dart';



class CustomNavbar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
          )
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Color(0xFFDBEAFE),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text("PP",
                      style: TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.bold)),
                ),
              ),
              SizedBox(width: 8),
              Text(
                "ParcelPantry",
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E3A8A)),
              ),
            ],
          ),

          Row(
            children: [
              CircleAvatar(
                backgroundColor: Color(0xFFDBEAFE),
                child: Text("A",
                    style: TextStyle(color: Color(0xFF1D4ED8))),
              ),
              SizedBox(width: 12),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[200],
                  foregroundColor: Colors.black,
                ),
                child: Text("Logout"),
              )
            ],
          )
        ],
      ),
    );
  }
}