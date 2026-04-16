import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Required for Clipboard
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class Member {
  final String id;
  final String firstName;
  final String lastName;
  final String role;

  Member({required this.id, required this.firstName, required this.lastName, required this.role});

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['_id'],
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      role: json['role'] ?? 'Member',
    );
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // --- State ---
  String houseId = "";
  String houseName = "Loading...";
  String inviteCode = "------";
  List<Member> members = [];
  bool isLoading = true;
  bool isAdmin = false;
  bool isEditingName = false;
  
  final TextEditingController _nameController = TextEditingController();
  late String currentUserId;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  String buildPath(String route) => "http://10.0.2.2:5000/$route";

  Future<void> _loadInitialData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');
    currentUserId = userData['id'];

    try {
      // 1. Fetch House Info
      final houseRes = await http.get(Uri.parse(buildPath("api/houses/user/$currentUserId")));
      if (houseRes.statusCode == 200) {
        final houseData = jsonDecode(houseRes.body);
        if (houseData['households'] != null && houseData['households'].isNotEmpty) {
          final house = houseData['households'][0];
          
          setState(() {
            houseId = house['_id'];
            houseName = house['name'];
            _nameController.text = houseName;
            isAdmin = house['role'] == "Admin";
            inviteCode = house['password'] ?? "------";
          });

          // 2. Fetch Members
          final membersRes = await http.get(Uri.parse(buildPath("api/houses/$houseId")));
          if (membersRes.statusCode == 200) {
            final membersData = jsonDecode(membersRes.body);
            setState(() {
              members = (membersData['members'] as List)
                  .map((m) => Member.fromJson(m))
                  .toList();
            });
          }
        }
      }
    } catch (e) {
      debugPrint("Error loading settings: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> handleUpdateName() async {
    if (_nameController.text.trim().isEmpty) return;

    try {
      final response = await http.put(
        Uri.parse(buildPath("api/houses/$houseId")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"name": _nameController.text.trim()}),
      );

      if (response.statusCode == 200) {
        setState(() {
          houseName = _nameController.text.trim();
          isEditingName = false;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to update name.")),
      );
    }
  }

  void copyToClipboard() {
    Clipboard.setData(ClipboardData(text: inviteCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Invite code copied!")),
    );
  }

  Future<void> handleRemoveUser(String userId, bool isSelf) async {
    try {
      final response = await http.delete(Uri.parse(buildPath("api/houses/$userId")));
      if (response.statusCode == 200) {
        if (isSelf) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('user_data');
          if (!mounted) return;
          Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
        } else {
          setState(() => members.removeWhere((m) => m.id == userId));
        }
      }
    } catch (e) {
      debugPrint("Remove error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black54),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text("Settings", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader("HOUSEHOLD INFORMATION"),
            _buildNameEditor(),
            const SizedBox(height: 32),
            
            _buildSectionHeader("INVITE CODE"),
            _buildInviteSection(),
            const SizedBox(height: 32),

            _buildSectionHeader("RESIDENT DIRECTORY"),
            ...members.map((m) => _buildMemberTile(m)),
            const SizedBox(height: 40),

            Center(
              child: ElevatedButton(
                onPressed: () => _showConfirmationModal(currentUserId, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                child: const Text("Leave House", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black45, letterSpacing: 1.5)),
    );
  }

  Widget _buildNameEditor() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: isEditingName
              ? TextField(
                  controller: _nameController,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue),
                  decoration: const InputDecoration(border: UnderlineInputBorder()),
                )
              : Text(houseName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
            child: Text(isEditingName ? "Save" : "Edit", style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
      ],
    );
  }

  Widget _buildInviteSection() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.blue[100]!)),
          child: Text(inviteCode, style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Colors.blue)),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: copyToClipboard,
          child: const Text("COPY", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black38)),
        ),
      ],
    );
  }

  Widget _buildMemberTile(Member m) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.black12)),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.grey[200],
            child: Text(m.firstName.isNotEmpty ? m.firstName[0] : "?"),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("${m.firstName} ${m.id == currentUserId ? '(You)' : ''}", style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(m.role.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue)),
              ],
            ),
          ),
          if (isAdmin && m.id != currentUserId)
            IconButton(
              icon: const Icon(Icons.close, color: Colors.grey),
              onPressed: () => _showConfirmationModal(m.id, false, name: m.firstName),
            ),
        ],
      ),
    );
  }

  void _showConfirmationModal(String userId, bool isSelf, {String? name}) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(isSelf ? "Are you sure?" : "Remove $name?"),
        content: Text(isSelf ? "You will lose access to this pantry." : "They will need a new code to rejoin."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              handleRemoveUser(userId, isSelf);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: Text(isSelf ? "Yes, Leave" : "Remove"),
          ),
        ],
      ),
    );
  }
}