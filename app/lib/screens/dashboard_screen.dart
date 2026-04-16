import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List items = [];
  List notifications = [];

  String search = "";
  String viewMode = "all";

  bool isLoading = true;

  Map<String, dynamic>? userData;

  String buildPath(String route) {
    return "http://localhost:5555/$route";
  }

  // ================= INIT =================
  @override
  void initState() {
    super.initState();
    loadUser();
  }

  Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString("user_data");

    if (stored == null) {
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, "/", (_) => false);
      return;
    }

    userData = jsonDecode(stored);

    await fetchPantry();
    await fetchNotifications();

    setState(() => isLoading = false);
  }

  String get houseID => userData?["houseID"] ?? "";
  String get firstName => userData?["firstName"] ?? "User";
  String get userID => userData?["id"] ?? "";

  // ================= FETCH =================
  Future<void> fetchPantry() async {
    if (houseID.isEmpty) return;

    try {
      final response = await http.get(
        Uri.parse(buildPath("pantry/$houseID?search=$search")),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() => items = data["items"] ?? []);
      }
    } catch (e) {
      debugPrint("Pantry error: $e");
    }
  }

  Future<void> fetchNotifications() async {
    if (houseID.isEmpty) return;

    try {
      final response = await http.get(
        Uri.parse(buildPath("api/getNotifications/$houseID")),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data is List ? data : data["notifications"] ?? [];

        list.sort((a, b) =>
            DateTime.parse(b["createdAt"])
                .compareTo(DateTime.parse(a["createdAt"])));

        setState(() => notifications = list.take(10).toList());
      }
    } catch (e) {
      debugPrint("Notif error: $e");
    }
  }

  Future<void> sendActivity(String message) async {
    if (houseID.isEmpty) return;

    try {
      await http.post(
        Uri.parse(buildPath("api/addNotification")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "houseID": houseID,
          "userName": firstName,
          "message": message
        }),
      );

      fetchNotifications();
    } catch (e) {
      debugPrint("Activity error: $e");
    }
  }

  // ================= CRUD =================
  Future<void> addItem(String name, int stock, String category) async {
    try {
      final response = await http.post(
        Uri.parse(buildPath("pantry")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "foodName": name,
          "Stock": stock,
          "Category": category,
          "houseID": houseID,
          "userID": userID
        }),
      );

      if (response.statusCode == 200) {
        sendActivity("added $name");
        fetchPantry();
      }
    } catch (e) {
      debugPrint("Add error: $e");
    }
  }

  Future<void> updateStock(String id, int stock, String name) async {
    try {
      await http.put(
        Uri.parse(buildPath("pantry/$id")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"Stock": stock, "userID": userID}),
      );

      sendActivity("updated $name to $stock");
      fetchPantry();
    } catch (e) {
      debugPrint("Update error: $e");
    }
  }

  Future<void> deleteItem(String id, String name) async {
    try {
      await http.delete(Uri.parse(buildPath("pantry/$id")));
      sendActivity("deleted $name");
      fetchPantry();
    } catch (e) {
      debugPrint("Delete error: $e");
    }
  }

  // ================= UI =================
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: isLoading
          ? const CircularProgressIndicator()
          : SingleChildScrollView(
              child: Column(
                children: [
                  Text(
                    "House Pantry",
                    style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0D47A1)),
                  ),
                  Text("Welcome, $firstName"),

                  const SizedBox(height: 20),

                  // SEARCH
                  TextField(
                    decoration: const InputDecoration(
                      hintText: "Search...",
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (val) {
                      search = val;
                      fetchPantry();
                    },
                  ),

                  const SizedBox(height: 20),

                  // ADD BUTTON
                  CustomButton(
                    text: "+ Add Item",
                    onPressed: () => showAddDialog(),
                  ),

                  const SizedBox(height: 20),

                  // ITEMS
                  CardContainer(
                    child: Column(
                      children: displayedItems().map((item) {
                        return ListTile(
                          title: Text(item["foodName"]),
                          subtitle: Text("Qty: ${item["Stock"]}"),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit),
                                onPressed: () => showEditDialog(item),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete),
                                onPressed: () =>
                                    deleteItem(item["_id"], item["foodName"]),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // NOTIFICATIONS
                  CardContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Household Feed",
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        ...notifications.map((n) {
                          return Text("${n["userName"]}: ${n["message"]}");
                        })
                      ],
                    ),
                  )
                ],
              ),
            ),
    );
  }

  List displayedItems() {
    if (viewMode == "all") return items;
    return items.where((i) => i["Stock"] == 0).toList();
  }

  // ================= DIALOGS =================
  void showAddDialog() {
    final nameCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: "1");
    String category = "General";

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Add Item"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: "Name")),
            TextField(controller: stockCtrl, keyboardType: TextInputType.number),
            DropdownButton<String>(
              value: category,
              items: ["General", "Dairy", "Produce", "Meat"]
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (val) => category = val!,
            )
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          TextButton(
            onPressed: () {
              addItem(nameCtrl.text, int.tryParse(stockCtrl.text) ?? 0, category);
              Navigator.pop(context);
            },
            child: const Text("Save"),
          )
        ],
      ),
    );
  }

  void showEditDialog(Map item) {
    int stock = item["Stock"];

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text("Edit ${item["foodName"]}"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Stock: $stock"),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                    onPressed: () => setState(() => stock--),
                    icon: const Icon(Icons.remove)),
                IconButton(
                    onPressed: () => setState(() => stock++),
                    icon: const Icon(Icons.add)),
              ],
            )
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              updateStock(item["_id"], 0, item["foodName"]);
              Navigator.pop(context);
            },
            child: const Text("Out of Stock"),
          ),
          TextButton(
            onPressed: () {
              updateStock(item["_id"], stock, item["foodName"]);
              Navigator.pop(context);
            },
            child: const Text("Save"),
          )
        ],
      ),
    );
  }
}