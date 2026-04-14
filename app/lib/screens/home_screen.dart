import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';

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

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Household> households = [];
  bool isLoading = true;
  bool showJoinInput = false;
  final inviteCodeController = TextEditingController();
  String generatedCode = "";

  @override
  void initState() {
    super.initState();
    fetchMyHouses();
  }

  String buildPath(String route) {
    return "http://10.0.2.2:5000/$route";
  }

  Future<void> fetchMyHouses() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');
    final userId = userData['id'];

    if (userId == null) return;

    try {
      final response = await http.get(Uri.parse(buildPath("api/houses/user/$userId")));
      final data = jsonDecode(response.body);

      if (data['households'] != null) {
        setState(() {
          households = (data['households'] as List)
              .map((h) => Household.fromJson(h))
              .toList();
        });
      }
    } catch (err) {
      debugPrint("Error fetching households: $err");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> handleCreateHouse() async {
    String houseName = "";
    
    // Equivalent to JS prompt()
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("New Household"),
        content: TextField(
          onChanged: (value) => houseName = value,
          decoration: const InputDecoration(hintText: "Enter a name"),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          TextButton(onPressed: () => Navigator.pop(context, houseName), child: const Text("Create")),
        ],
      ),
    );

    if (name == null || name.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');

    try {
      final response = await http.post(
        Uri.parse(buildPath('api/houses')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'Admin': userData['id'],
          'HouseName': name,
        }),
      );

      final data = jsonDecode(response.body);

      if (data['error'] != null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(data['error'])));
      } else {
        setState(() {
          generatedCode = data['house']['password'];
          households.add(Household(id: data['user']['houseID'], name: name, role: "Admin"));
        });
        _showSuccessModal();
      }
    } catch (err) {
      debugPrint("Creation Error: $err");
    }
  }

  Future<void> handleJoinHouse() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');

    try {
      final response = await http.post(
        Uri.parse(buildPath('api/houses/join')),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userID': userData['id'],
          'password': inviteCodeController.text.toUpperCase(),
        }),
      );

      final data = jsonDecode(response.body);

      if (data['error'] != null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(data['error'])));
      } else {
        userData['houseID'] = data['user']['houseID'];
        await prefs.setString('user_data', jsonEncode(userData));
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } catch (err) {
      debugPrint("Join Error: $err");
    }
  }

  void _showSuccessModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 16),
            const Text("Household Created!", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text("Share this code with roommates:", textAlign: TextAlign.center),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
              child: Text(generatedCode, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 4, color: Colors.blue)),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/dashboard'),
                child: const Text("Go to Dashboard"),
              ),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
        child: Column(
          children: [
            const Text("YOUR HOUSEHOLDS", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1))),
            const Text("Select a household to manage your pantry", style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 40),
            
            // ACTIONS SECTION
            _buildActionButton(
              title: "Create New Household",
              subtitle: "Start fresh and invite roommates",
              onTap: handleCreateHouse,
            ),
            const SizedBox(height: 16),
            
            if (!showJoinInput)
              _buildActionButton(
                title: "Join Existing Household",
                subtitle: "Enter a 6-digit invite code",
                onTap: () => setState(() => showJoinInput = true),
              )
            else
              _buildJoinInput(),

            const SizedBox(height: 40),

            // LIST SECTION
            const Align(
              alignment: Alignment.centerLeft,
              child: Text("Joined Households", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1))),
            ),
            const Divider(),
            Expanded(
              child: isLoading 
                ? const Center(child: CircularProgressIndicator())
                : households.isEmpty 
                  ? const Center(child: Text("No households joined yet."))
                  : ListView.builder(
                      itemCount: households.length,
                      itemBuilder: (context, index) {
                        final house = households[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            title: Text(house.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(house.role.toUpperCase(), style: const TextStyle(fontSize: 10)),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.blue),
                            onTap: () => Navigator.pushReplacementNamed(context, '/dashboard'),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({required String title, required String subtitle, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blue.shade100),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildJoinInput() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blue),
      ),
      child: Column(
        children: [
          TextField(
            controller: inviteCodeController,
            textCapitalization: TextCapitalization.characters,
            maxLength: 6,
            decoration: const InputDecoration(hintText: "e.g. A1B2C3", labelText: "Invite Code"),
          ),
          Row(
            children: [
              Expanded(child: ElevatedButton(onPressed: handleJoinHouse, child: const Text("Join"))),
              const SizedBox(width: 8),
              TextButton(onPressed: () => setState(() => showJoinInput = false), child: const Text("Cancel")),
            ],
          )
        ],
      ),
    );
  }
}