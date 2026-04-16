import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';
import '../widgets/card_container.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_tabButton.dart';

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

  String buildPath(String route) => "http://localhost:5555/$route";

  String get houseID => userData?["houseID"] ?? "";
  String get firstName => userData?["firstName"] ?? "User";
  String get userID => userData?["id"] ?? "";

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

  // ================= FETCH =================
  Future<void> fetchPantry() async {
    if (houseID.isEmpty) return;

    final res = await http.get(
      Uri.parse(buildPath("pantry/$houseID?search=$search")),
    );

    final data = jsonDecode(res.body);
    setState(() => items = data["items"] ?? []);
  }

  Future<void> fetchNotifications() async {
    if (houseID.isEmpty) return;

    final res = await http.get(
      Uri.parse(buildPath("api/getNotifications/$houseID")),
    );

    final data = jsonDecode(res.body);
    final list = data is List ? data : data["notifications"] ?? [];

    list.sort((a, b) =>
        DateTime.parse(b["createdAt"])
            .compareTo(DateTime.parse(a["createdAt"])));

    setState(() => notifications = list.take(10).toList());
  }

  Future<void> sendActivity(String msg) async {
    await http.post(
      Uri.parse(buildPath("api/addNotification")),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "houseID": houseID,
        "userName": firstName,
        "message": msg
      }),
    );

    fetchNotifications();
  }

  // ================= CRUD =================
  Future<void> addItem(String name, int stock, String category) async {
    await http.post(
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

    sendActivity("added $name");
    fetchPantry();
  }

  Future<void> updateStock(String id, int stock, String name) async {
    await http.put(
      Uri.parse(buildPath("pantry/$id")),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"Stock": stock, "userID": userID}),
    );

    sendActivity("updated $name to $stock");
    fetchPantry();
  }

  Future<void> deleteItem(String id, String name) async {
    await http.delete(Uri.parse(buildPath("pantry/$id")));
    sendActivity("deleted $name");
    fetchPantry();
  }

  // ================= FILTER =================
  List displayedItems() {
    if (viewMode == "all") return items;
    return items.where((i) => i["Stock"] == 0).toList();
  }

  // ================= UI =================
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
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

                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ================= LEFT PANEL =================
                      Expanded(
                        flex: 7,
                        child: Column(
                          children: [
                            buildTabs(),
                            const SizedBox(height: 12),
                            buildSearch(),
                            const SizedBox(height: 12),
                            Expanded(child: buildItemList()),
                          ],
                        ),
                      ),

                      const SizedBox(width: 20),

                      // ================= RIGHT PANEL =================
                      Expanded(
                        flex: 3,
                        child: buildFeed(),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                CustomButton(
                  text: "+ Add Item",
                  onPressed: showAddDialog,
                ),
              ],
            ),
    );
  }

  // ================= COMPONENTS =================
  Widget buildTabs() {
    return Row(
      children: [
        TabButton(
          label: "All",
          value: "all",
          currentValue: viewMode,
          onTap: (val) => setState(() => viewMode = val),
        ),
        const SizedBox(width: 10),
        TabButton(
          label: "Out of Stock",
          value: "out",
          currentValue: viewMode,
          onTap: (val) => setState(() => viewMode = val),
        ),
      ],
    );
  }

  Widget buildSearch() {
    return TextField(
      decoration: const InputDecoration(
        hintText: "Search items...",
        border: OutlineInputBorder(),
      ),
      onChanged: (val) {
        search = val;
        fetchPantry();
      },
    );
  }

  Widget buildItemList() {
    return CardContainer(
      child: ListView(
        children: displayedItems().map<Widget>((item) {
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
    );
  }

  Widget buildFeed() {
    return CardContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Activity Feed",
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ...notifications.map((n) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text("${n["userName"]}: ${n["message"]}"),
            );
          })
        ],
      ),
    );
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
            TextField(controller: nameCtrl),
            TextField(controller: stockCtrl),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          TextButton(
            onPressed: () {
              addItem(nameCtrl.text, int.parse(stockCtrl.text), category);
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
        title: Text(item["foodName"]),
        content: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
                onPressed: () => setState(() => stock--),
                icon: const Icon(Icons.remove)),
            Text("$stock"),
            IconButton(
                onPressed: () => setState(() => stock++),
                icon: const Icon(Icons.add)),
          ],
        ),
        actions: [
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