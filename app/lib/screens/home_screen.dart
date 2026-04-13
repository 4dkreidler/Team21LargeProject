import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class Household {
  final String id;
  final String name;
  final String role;

  Household({required this.id, required this.name, required this.role});

  factory Household.fromJson(Map<String, dynamic> json) {
    return Household(
      id: json['_id'],
      name: json['name'],
      role: json['role'],
    );
  }
}

class _HomeScreenState extends State<HomeScreen> {
  List<Household> households = [];
  bool loading = true;

  bool showJoinInput = false;
  String inviteCode = "";

  bool showSuccessModal = false;
  String generatedCode = "";

  
  Future<Map<String, dynamic>> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData == null) return {};
    return jsonDecode(userData);
  }

  Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user));
  }

  
  Future<void> handleCreateHouse() async {
    TextEditingController controller = TextEditingController();

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Create Household"),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: "Enter house name"),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);

              final houseName = controller.text;
              if (houseName.isEmpty) return;

              final user = await getUser();
              final userId = user['id'];

              final response = await http.post(
                Uri.parse('http://localhost:5000/api/houses'),
                headers: {"Content-Type": "application/json"},
                body: jsonEncode({
                  "Admin": userId,
                  "HouseName": houseName,
                }),
              );

              final data = jsonDecode(response.body);

              if (data['error'] != null) {
                showError(data['error']);
              } else {
                setState(() {
                  households = [
                    Household(
                      id: data['user']['houseID'],
                      name: houseName,
                      role: "Admin",
                    )
                  ];
                  generatedCode = data['house']['password'];
                  showSuccessModal = true;
                });
              }
            },
            child: const Text("Create"),
          ),
        ],
      ),
    );
  }

  
  Future<void> handleJoinHouse() async {
    final user = await getUser();
    final userId = user['id'];

    final response = await http.post(
      Uri.parse('http://localhost:5000/api/houses/join'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "userID": userId,
        "password": inviteCode,
      }),
    );

    final data = jsonDecode(response.body);

    if (data['error'] != null) {
      showError(data['error']);
    } else {
      user['houseID'] = data['user']['houseID'];
      await saveUser(user);

      Navigator.pushReplacementNamed(context, "/dashboard");
    }
  }

  
  Future<void> fetchHouses() async {
    final user = await getUser();
    final userId = user['id'];

    if (userId == null) return;

    try {
      final response = await http.get(
        Uri.parse('http://localhost:5000/api/houses/user/$userId'),
      );

      final data = jsonDecode(response.body);

      if (data['households'] != null) {
        setState(() {
          households = (data['households'] as List)
              .map((h) => Household.fromJson(h))
              .toList();
        });
      }
    } catch (e) {
      debugPrint("Fetch error: $e");
    } finally {
      setState(() => loading = false);
    }
  }

  
  Future<void> selectHouse(String houseID) async {
    final user = await getUser();
    user['houseID'] = houseID;
    await saveUser(user);

    Navigator.pushReplacementNamed(context, "/dashboard");
  }

  void finishCreate() {
    Navigator.pushReplacementNamed(context, "/dashboard");
  }

  void showError(String message) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Error"),
        content: Text(message),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    fetchHouses();
  }

  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Your Households")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // CREATE BUTTON
            ElevatedButton(
              onPressed: handleCreateHouse,
              child: const Text("Create New Household"),
            ),

            const SizedBox(height: 10),

            // JOIN SECTION
            if (!showJoinInput)
              ElevatedButton(
                onPressed: () {
                  setState(() => showJoinInput = true);
                },
                child: const Text("Join Household"),
              )
            else
              Column(
                children: [
                  TextField(
                    maxLength: 6,
                    onChanged: (value) {
                      inviteCode = value.toUpperCase();
                    },
                    decoration:
                        const InputDecoration(labelText: "Invite Code"),
                  ),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: handleJoinHouse,
                        child: const Text("Join"),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() => showJoinInput = false);
                        },
                        child: const Text("Cancel"),
                      ),
                    ],
                  )
                ],
              ),

            const SizedBox(height: 20),

            // LIST
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : households.isEmpty
                      ? const Center(
                          child: Text("No households yet."),
                        )
                      : ListView.builder(
                          itemCount: households.length,
                          itemBuilder: (context, index) {
                            final house = households[index];

                            return ListTile(
                              title: Text(house.name),
                              subtitle: Text(house.role),
                              trailing: const Icon(Icons.arrow_forward),
                              onTap: () => selectHouse(house.id),
                            );
                          },
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
                      style: const TextStyle(
                          fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                actions: [
                  ElevatedButton(
                    onPressed: finishCreate,
                    child: const Text("Go to Dashboard"),
                  )
                ],
              )
          ],
        ),
      ),
    );
  }
}