import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List households = [];
  bool isLoading = true;

  bool showJoinInput = false;
  bool showSuccessModal = false;

  String inviteCode = "";
  String generatedCode = "";

  final inviteController = TextEditingController();

  String buildPath(String route) {
    return "http://localhost:5555/$route";
  }

  // ================= CREATE HOUSE =================
  Future<void> handleCreateHouse() async {
    String? houseName = await _showInputDialog("Enter Household Name");

    if (houseName == null || houseName.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final storedUser = jsonDecode(prefs.getString("user_data") ?? "{}");
    final userId = storedUser["id"];

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/houses")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "Admin": userId,
          "HouseName": houseName,
        }),
      );

      final data = jsonDecode(response.body);

      if (data["error"] != null) {
        _showMessage(data["error"]);
      } else {
        setState(() {
          households = [
            {
              "_id": data["user"]["houseID"],
              "name": houseName,
              "role": "Admin"
            }
          ];
          generatedCode = data["house"]["password"];
          showSuccessModal = true;
        });
      }
    } catch (err) {
      debugPrint("Create error: $err");
    }
  }

  // ================= JOIN HOUSE =================
  Future<void> handleJoinHouse() async {
    final prefs = await SharedPreferences.getInstance();
    final storedUser = jsonDecode(prefs.getString("user_data") ?? "{}");

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/houses/join")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "userID": storedUser["id"],
          "password": inviteController.text.trim(),
        }),
      );

      final data = jsonDecode(response.body);

      if (data["error"] != null) {
        _showMessage(data["error"]);
      } else {
        final updatedUser = {
          ...storedUser,
          "houseID": data["user"]["houseID"]
        };

        await prefs.setString("user_data", jsonEncode(updatedUser));

        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(context, "/dashboard", (_) => false);
      }
    } catch (err) {
      debugPrint("Join error: $err");
    }
  }

  // ================= FETCH HOUSES =================
  Future<void> fetchHouses() async {
    final prefs = await SharedPreferences.getInstance();
    final storedUser = jsonDecode(prefs.getString("user_data") ?? "{}");

    final userId = storedUser["id"];
    final houseID = storedUser["houseID"];

    if (userId == null || houseID == "-1") {
      setState(() => isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse(buildPath("api/houses/user/$userId")),
      );

      final data = jsonDecode(response.body);

      if (data["households"] != null) {
        setState(() {
          households = data["households"];
        });
      }
    } catch (err) {
      debugPrint("Fetch error: $err");
    } finally {
      setState(() => isLoading = false);
    }
  }

  // ================= SELECT HOUSE =================
  Future<void> handleSelectHouse(String houseID) async {
    final prefs = await SharedPreferences.getInstance();
    final storedUser = jsonDecode(prefs.getString("user_data") ?? "{}");

    final updatedUser = {
      ...storedUser,
      "houseID": houseID
    };

    await prefs.setString("user_data", jsonEncode(updatedUser));

    if (!mounted) return;
    Navigator.pushNamed(context, "/dashboard");
  }

  // ================= UI HELPERS =================
  Future<String?> _showInputDialog(String title) async {
    TextEditingController controller = TextEditingController();

    return showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: TextField(controller: controller),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void finishCreate() {
    Navigator.pushNamedAndRemoveUntil(context, "/dashboard", (_) => false);
  }

  // ================= INIT =================
  @override
  void initState() {
    super.initState();
    fetchHouses();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: SingleChildScrollView(
        child: Column(
          children: [
            const Text(
              "Your Households",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1)),
            ),
            const SizedBox(height: 8),
            const Text("Select a household to manage your pantry", style: TextStyle(color: Colors.grey)),

            const SizedBox(height: 24),

            // ACTIONS
            CardContainer(
              child: Column(
                children: [
                  CustomButton(
                    text: "Create New Household",
                    onPressed: handleCreateHouse,
                  ),
                  const SizedBox(height: 12),

                  if (!showJoinInput)
                    CustomButton(
                      text: "Join Household",
                      onPressed: () {
                        setState(() => showJoinInput = true);
                      },
                    )
                  else ...[
                    CustomInput(label: "Invite Code", controller: inviteController),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: CustomButton(text: "Join", onPressed: handleJoinHouse)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: CustomButton(
                            text: "Cancel",
                            onPressed: () => setState(() => showJoinInput = false),
                          ),
                        ),
                      ],
                    )
                  ]
                ],
              ),
            ),

            const SizedBox(height: 24),

            // LIST
            CardContainer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Joined Households", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),

                  const SizedBox(height: 12),

                  if (isLoading)
                    const Text("Loading...")
                  else if (households.isEmpty)
                    const Text("No households yet")
                  else
                    Column(
                      children: households.map<Widget>((house) {
                        return ListTile(
                          title: Text(house["name"]),
                          subtitle: Text(house["role"]),
                          trailing: const Icon(Icons.arrow_forward),
                          onTap: () => handleSelectHouse(house["_id"]),
                        );
                      }).toList(),
                    )
                ],
              ),
            ),

            // SUCCESS MODAL
            if (showSuccessModal)
              AlertDialog(
                title: const Text("Household Created!"),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text("Share this code:"),
                    const SizedBox(height: 10),
                    Text(
                      generatedCode,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                actions: [
                  TextButton(onPressed: finishCreate, child: const Text("Go to Dashboard"))
                ],
              )
          ],
        ),
      ),
    );
  }
}