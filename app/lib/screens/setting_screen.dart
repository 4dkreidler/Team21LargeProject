import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class Member {
  final String id;
  final String firstName;
  final String lastName;
  final String role;

  Member({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['_id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      role: json['role'],
    );
  }
}

class _SettingsScreenState extends State<SettingsScreen> {
  String houseId = "";
  String houseName = "Loading...";
  String inviteCode = "------";
  List<Member> members = [];
  bool loading = true;
  bool isAdmin = false;

  bool isEditingName = false;
  String newHouseName = "";

  bool showLeaveModal = false;
  Member? memberToRemove;

  String currentUserId = "";

  String buildPath(String path) {
    return "http://localhost:8080/$path"; // adjust for your backend
  }

  @override
  void initState() {
    super.initState();
    loadUserAndFetchData();
  }

  Future<void> loadUserAndFetchData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');

    if (userData != null) {
      final decoded = jsonDecode(userData);
      currentUserId = decoded['id'];
      fetchAllData();
    }
  }

  Future<void> fetchAllData() async {
    try {
      final houseRes = await http.get(
        Uri.parse(buildPath("api/houses/user/$currentUserId")),
      );

      final houseData = jsonDecode(houseRes.body);

      if (houseData['households'] != null &&
          houseData['households'].length > 0) {
        final house = houseData['households'][0];

        setState(() {
          houseId = house['_id'];
          houseName = house['name'];
          isAdmin = house['role'] == "Admin";
          if (house['password'] != null) {
            inviteCode = house['password'];
          }
        });

        final membersRes = await http.get(
          Uri.parse(buildPath("api/houses/$houseId")),
        );

        final membersData = jsonDecode(membersRes.body);

        setState(() {
          members = (membersData['members'] as List)
              .map((m) => Member.fromJson(m))
              .toList();
        });
      }

      setState(() => loading = false);
    } catch (e) {
      print("Error: $e");
      setState(() => loading = false);
    }
  }

  Future<void> handleUpdateName() async {
    if (newHouseName.trim().isEmpty) return;

    try {
      await http.put(
        Uri.parse(buildPath("api/houses/$houseId")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"name": newHouseName}),
      );

      setState(() {
        houseName = newHouseName;
        isEditingName = false;
      });
    } catch (e) {
      showError("Failed to update name.");
    }
  }

  Future<void> handleRemoveUser(String userId, bool isSelf) async {
    try {
      await http.delete(Uri.parse(buildPath("api/houses/$userId")));

      if (isSelf) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('user_data');

        Navigator.pushReplacementNamed(context, "/");
      } else {
        setState(() {
          members.removeWhere((m) => m.id == userId);
          memberToRemove = null;
        });
      }
    } catch (e) {
      showError("Failed to remove user.");
    }
  }

  void copyInviteCode() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Invite code copied!")),
    );
  }

  void showError(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: Text("Loading household settings...")),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Settings"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushNamed(context, "/dashboard"),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            /// Household Name
            const Text("Household Information",
                style: TextStyle(fontWeight: FontWeight.bold)),

            Row(
              children: [
                Expanded(
                  child: isEditingName
                      ? TextField(
                          controller:
                              TextEditingController(text: newHouseName),
                          onChanged: (v) => newHouseName = v,
                        )
                      : Text(houseName,
                          style: const TextStyle(fontSize: 20)),
                ),
                if (isAdmin)
                  isEditingName
                      ? Row(
                          children: [
                            TextButton(
                                onPressed: handleUpdateName,
                                child: const Text("Save")),
                            TextButton(
                                onPressed: () =>
                                    setState(() => isEditingName = false),
                                child: const Text("Cancel")),
                          ],
                        )
                      : TextButton(
                          onPressed: () {
                            setState(() {
                              newHouseName = houseName;
                              isEditingName = true;
                            });
                          },
                          child: const Text("Edit"),
                        )
              ],
            ),

            const SizedBox(height: 20),

            /// Invite Code
            const Text("Invite Code"),
            Row(
              children: [
                Text(inviteCode,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                TextButton(
                    onPressed: copyInviteCode,
                    child: const Text("Copy")),
              ],
            ),

            const SizedBox(height: 20),

            /// Members
            const Text("Residents",
                style: TextStyle(fontWeight: FontWeight.bold)),

            ...members.map((m) => ListTile(
                  title: Text(
                      "${m.firstName} ${m.id == currentUserId ? "(You)" : ""}"),
                  subtitle: Text(m.role),
                  trailing: isAdmin && m.id != currentUserId
                      ? IconButton(
                          icon: const Icon(Icons.close, color: Colors.red),
                          onPressed: () =>
                              setState(() => memberToRemove = m),
                        )
                      : null,
                )),

            const SizedBox(height: 30),

            /// Leave Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              onPressed: () => setState(() => showLeaveModal = true),
              child: const Text("Leave House"),
            )
          ],
        ),
      ),

      /// Leave Modal
      floatingActionButton: showLeaveModal
          ? _buildLeaveDialog()
          : memberToRemove != null
              ? _buildRemoveDialog()
              : null,
    );
  }

  Widget _buildLeaveDialog() {
    return AlertDialog(
      title: const Text("Are you sure?"),
      content: const Text("You will lose access to this household."),
      actions: [
        TextButton(
          onPressed: () =>
              handleRemoveUser(currentUserId, true),
          child: const Text("Yes, Leave"),
        ),
        TextButton(
          onPressed: () => setState(() => showLeaveModal = false),
          child: const Text("Cancel"),
        ),
      ],
    );
  }

  Widget _buildRemoveDialog() {
    return AlertDialog(
      title: Text("Remove ${memberToRemove!.firstName}?"),
      content: const Text("They will need a new code to rejoin."),
      actions: [
        TextButton(
          onPressed: () =>
              handleRemoveUser(memberToRemove!.id, false),
          child: const Text("Remove"),
        ),
        TextButton(
          onPressed: () => setState(() => memberToRemove = null),
          child: const Text("Cancel"),
        ),
      ],
    );
  }
}