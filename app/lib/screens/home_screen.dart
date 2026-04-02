import 'package:flutter/material.dart';
import '../widgets/Layout.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool loading = true;
  List households = [];

  @override
  void initState() {
    super.initState();

    Future.delayed(Duration(milliseconds: 500), () {
      setState(() {
        loading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Column(
        children: [
          Text("YOUR HOUSEHOLDS",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),

          SizedBox(height: 20),

          loading
              ? Text("Loading...")
              : households.isEmpty
                  ? Text("No households yet")
                  : ListView.builder(
                      shrinkWrap: true,
                      itemCount: households.length,
                      itemBuilder: (context, index) {
                        final house = households[index];

                        return ListTile(
                          title: Text(house['name']),
                          subtitle: Text(house['role']),
                        );
                      },
                    ),
        ],
      ),
    );
  }
}