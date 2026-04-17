import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';



class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String houseId = "";
  String houseName = "Loading...";
  String inviteCode = "------";

  List members = [];

  bool isLoading = true;
  bool isAdmin = false;

  bool isEditingName = false;
  String newHouseName = "";

  Map<String, dynamic>? userData;

  String buildPath(String route) {
    return "http://localhost:5555/$route";
  }

  String get currentUserId => userData?["id"] ?? "";

  // ================= INIT =================
  @override
  void initState() {
    super.initState();
    loadData();
  }

  Future<void> loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString("user_data");

    if (stored == null) {
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, "/login", (_) => false);
      return;
    }

    userData = jsonDecode(stored);

    try {
      final houseRes = await http.get(
        Uri.parse(buildPath("api/houses/user/$currentUserId")),
      );

      final houseData = jsonDecode(houseRes.body);

      if (houseData["households"] != null &&
          houseData["households"].length > 0) {
        final house = houseData["households"][0];

        houseId = house["_id"];
        houseName = house["name"];
        isAdmin = house["role"] == "Admin";

        final membersRes = await http.get(
          Uri.parse(buildPath("api/houses/$houseId")),
        );

        final membersData = jsonDecode(membersRes.body);
        members = membersData["members"] ?? [];

        inviteCode =
            house["inviteCode"] ?? house["code"] ?? house["password"] ?? "N/A";
      }
    } catch (e) {
      debugPrint("Settings error: $e");
    }

    setState(() => isLoading = false);
  }

  // ================= ACTIONS =================
  Future<void> handleUpdateName() async {
    if (newHouseName.trim().isEmpty) return;

    try {
      final response = await http.post(
        Uri.parse(buildPath("api/houses/update")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "houseID": houseId,
          "newName": newHouseName,
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          houseName = newHouseName;
          isEditingName = false;
        });

        _showMessage("Name updated!");
      }
    } catch (e) {
      _showMessage("Failed to update");
    }
  }

  void copyToClipboard() {
    Clipboard.setData(ClipboardData(text: inviteCode));
    _showMessage("Copied!");
  }

  Future<void> handleRemoveUser(String userId, bool isSelf) async {
    try {
      await http.delete(
        Uri.parse(buildPath("api/houses/$userId")),
      );

      if (isSelf) {
        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(context, "/home", (_) => false);
      } else {
        setState(() {
          members.removeWhere((m) => m["_id"] == userId);
        });
      }
    } catch (e) {
      _showMessage("Failed to remove user");
    }
  }

  void _showMessage(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // ================= UI =================
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: isLoading
          ? const CircularProgressIndicator()
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // HEADER
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: () =>
                            Navigator.pushNamed(context, "/dashboard"),
                      ),
                      const Text(
                        "Settings",
                        style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0D47A1)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  CardContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // HOUSE NAME
                        const Text("Household Name",
                            style: TextStyle(fontSize: 12)),

                        Row(
                          children: [
                            Expanded(
                              child: isEditingName
                                  ? TextField(
                                      onChanged: (val) =>
                                          newHouseName = val,
                                      decoration: const InputDecoration(),
                                    )
                                  : Text(
                                      houseName,
                                      style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold),
                                    ),
                            ),
                            if (isAdmin)
                              TextButton(
                                onPressed: () {
                                  if (isEditingName) {
                                    handleUpdateName();
                                  } else {
                                    setState(() => isEditingName = true);
                                  }
                                },
                                child: Text(isEditingName ? "Save" : "Edit"),
                              )
                          ],
                        ),

                        const SizedBox(height: 20),

                        // INVITE CODE
                        const Text("Invite Code",
                            style: TextStyle(fontSize: 12)),

                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                inviteCode,
                                style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                            TextButton(
                              onPressed: copyToClipboard,
                              child: const Text("Copy"),
                            )
                          ],
                        ),

                        const SizedBox(height: 20),

                        // MEMBERS
                        const Text("Members",
                            style: TextStyle(fontWeight: FontWeight.bold)),

                        const SizedBox(height: 10),

                        ...members.map((m) {
                          final name =
                              "${m["firstName"] ?? "User"} ${m["lastName"] ?? ""}";
                          final isMe = m["_id"] == currentUserId;

                          return ListTile(
                            title: Text("$name ${isMe ? "(You)" : ""}"),
                            subtitle: Text(m["role"] ?? "Member"),
                            trailing: isAdmin && !isMe
                                ? IconButton(
                                    icon: const Icon(Icons.close),
                                    onPressed: () =>
                                        showRemoveDialog(m["_id"]),
                                  )
                                : null,
                          );
                        }).toList(),

                        const SizedBox(height: 20),

                        // LEAVE BUTTON
                        Center(
                          child: CustomButton(
                            text: "Leave Household",
                            onPressed: () => showLeaveDialog(),
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
    );
  }

  // ================= DIALOGS =================
  void showLeaveDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Leave House?"),
        content: const Text("You will lose access."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              handleRemoveUser(currentUserId, true);
            },
            child: const Text("Leave"),
          ),
        ],
      ),
    );
  }

  void showRemoveDialog(String userId) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Remove Member?"),
        content: const Text("This will remove them."),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel")),
          TextButton(
            onPressed: () {
              handleRemoveUser(userId, false);
              Navigator.pop(context);
            },
            child: const Text("Remove"),
          )
        ],
      ),
    );
  }
}
