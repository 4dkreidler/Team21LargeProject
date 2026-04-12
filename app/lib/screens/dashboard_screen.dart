import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PantryItem {
  final String id;
  final String foodName;
  final int stock;
  final String houseID;
  final String? category;

  PantryItem({
    required this.id,
    required this.foodName,
    required this.stock,
    required this.houseID,
    this.category,
  });

  factory PantryItem.fromJson(Map<String, dynamic> json) {
    return PantryItem(
      id: json['_id'],
      foodName: json['foodName'],
      stock: json['Stock'],
      houseID: json['houseID'],
      category: json['Category'],
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<PantryItem> items = [];
  String search = "";

  bool showModal = false;

  Map<String, dynamic> newItem = {
    "foodName": "",
    "Stock": 1,
    "Category": "General"
  };

  String houseID = "";
  String userID = "";
  String firstName = "User";

  // ===============================
  // LOAD USER
  // ===============================
  Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');

    if (userData != null) {
      final user = jsonDecode(userData);
      setState(() {
        houseID = user['houseID'] ?? "";
        userID = user['id'] ?? "";
        firstName = user['firstName'] ?? "User";
      });
    }
  }

  // ===============================
  // FETCH PANTRY
  // ===============================
  Future<void> fetchPantry() async {
    if (houseID.isEmpty) return;

    try {
      final response = await http.get(
        Uri.parse(
            'http://10.0.2.2:5000/api/pantry/$houseID?search=$search'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          items = (data['items'] as List)
              .map((item) => PantryItem.fromJson(item))
              .toList();
        });
      }
    } catch (e) {
      debugPrint("Fetch error: $e");
    }
  }

  // ===============================
  // ADD ITEM
  // ===============================
  Future<void> handleAddItem() async {
    if (houseID.isEmpty || userID.isEmpty) {
      showError("Session error: Please log in again.");
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/pantry'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "foodName": newItem["foodName"],
          "Stock": newItem["Stock"],
          "Category": newItem["Category"],
          "houseID": houseID,
          "userID": userID
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        setState(() {
          showModal = false;
          newItem = {"foodName": "", "Stock": 1, "Category": "General"};
        });
        fetchPantry();
      } else {
        showError(data["message"] ?? "Error adding item");
      }
    } catch (e) {
      debugPrint("Add item error: $e");
    }
  }

  void showError(String msg) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Error"),
        content: Text(msg),
      ),
    );
  }

  // ===============================
  // INIT
  // ===============================
  @override
  void initState() {
    super.initState();
    init();
  }

  Future<void> init() async {
    await loadUser();
    await fetchPantry();
  }

  // ===============================
  // UI
  // ===============================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("HOUSE PANTRY"),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => showModal = true),
        child: const Icon(Icons.add),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // WELCOME
            Text(
              "Welcome, $firstName!",
              style: const TextStyle(fontSize: 18),
            ),

            const SizedBox(height: 20),

            // SEARCH
            TextField(
              decoration: const InputDecoration(
                hintText: "Search pantry...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() => search = value);
                fetchPantry();
              },
            ),

            const SizedBox(height: 20),

            // LIST
            Expanded(
              child: items.isEmpty
                  ? const Center(child: Text("No items found."))
                  : ListView.builder(
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        final item = items[index];

                        return Card(
                          child: ListTile(
                            title: Text(item.foodName.toUpperCase()),
                            subtitle: const Text("Inventory Item"),
                            trailing: Text("Qty: ${item.stock}"),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),

      // ===============================
      // MODAL
      // ===============================
      bottomSheet: showModal
          ? Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Add New Item",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),

                  TextField(
                    decoration:
                        const InputDecoration(labelText: "Item Name"),
                    onChanged: (val) =>
                        newItem["foodName"] = val,
                  ),

                  TextField(
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(labelText: "Quantity"),
                    onChanged: (val) =>
                        newItem["Stock"] = int.tryParse(val) ?? 1,
                  ),

                  DropdownButton<String>(
                    value: newItem["Category"],
                    isExpanded: true,
                    items: ["General", "Dairy", "Produce", "Meat"]
                        .map((c) => DropdownMenuItem(
                              value: c,
                              child: Text(c),
                            ))
                        .toList(),
                    onChanged: (val) =>
                        setState(() => newItem["Category"] = val),
                  ),

                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: handleAddItem,
                          child: const Text("Save"),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextButton(
                          onPressed: () =>
                              setState(() => showModal = false),
                          child: const Text("Cancel"),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            )
          : null,
    );
  }
}