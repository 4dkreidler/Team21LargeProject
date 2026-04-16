import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/layout.dart';

class PantryItem {
  final String id;
  final String foodName;
  int stock;
  final String category;

  PantryItem({required this.id, required this.foodName, required this.stock, required this.category});

  factory PantryItem.fromJson(Map<String, dynamic> json) {
    return PantryItem(
      id: json['_id'],
      foodName: json['foodName'],
      stock: json['Stock'] ?? 0,
      category: json['Category'] ?? "General",
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
  String viewMode = "all"; // "all" or "shopping"
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
    fetchPantry();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getString('user_data') == null) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  String buildPath(String route) => "http://10.0.2.2:5000/$route";

  Future<void> fetchPantry() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');
    final houseID = userData['houseID'];

    if (houseID == null) return;

    try {
      final response = await http.get(Uri.parse(buildPath("pantry/$houseID?search=$search")));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          items = (data['items'] as List).map((i) => PantryItem.fromJson(i)).toList();
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Fetch error: $e");
    }
  }

  Future<void> updateStock(String itemID, int newStock) async {
    final prefs = await SharedPreferences.getInstance();
    final userData = jsonDecode(prefs.getString('user_data') ?? '{}');

    try {
      final response = await http.put(
        Uri.parse(buildPath("pantry/$itemID")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"Stock": newStock, "userID": userData['id']}),
      );

      if (response.statusCode == 200) {
        setState(() {
          items.firstWhere((item) => item.id == itemID).stock = newStock;
        });
      }
    } catch (e) {
      debugPrint("Update error: $e");
    }
  }

  Future<void> handleDeleteItem(PantryItem item) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Delete Item"),
        content: Text("Are you sure you want to remove ${item.foodName}?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text("Delete", style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirm == true) {
      await http.delete(Uri.parse(buildPath("pantry/${item.id}")));
      fetchPantry();
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayedItems = viewMode == "all" 
        ? items 
        : items.where((i) => i.stock == 0).toList();

    return Layout(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // HEADER
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.settings_outlined),
                      onPressed: () => Navigator.pushNamed(context, '/settings'),
                    ),
                    const Text("HOUSE PANTRY", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0D47A1))),
                  ],
                ),
                ElevatedButton(
                  onPressed: _showAddModal,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                  child: const Text("+ Add Item"),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // TOGGLE VIEW
            Container(
              decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  _toggleBtn("All Items", "all"),
                  _toggleBtn("Shopping List (${items.where((i) => i.stock == 0).length})", "shopping"),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // SEARCH
            TextField(
              onChanged: (val) {
                setState(() => search = val);
                fetchPantry();
              },
              decoration: InputDecoration(
                hintText: "Search pantry...",
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 20),

            // LIST
            Expanded(
              child: isLoading 
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
                    itemCount: displayedItems.length,
                    separatorBuilder: (_, __) => const Divider(),
                    itemBuilder: (context, index) {
                      final item = displayedItems[index];
                      return _buildPantryTile(item);
                    },
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _toggleBtn(String text, String mode) {
    bool isSelected = viewMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => viewMode = mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected ? [BoxShadow(color: Colors.black12, blurRadius: 4)] : [],
          ),
          child: Text(text, textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.blue : Colors.grey)),
        ),
      ),
    );
  }

  Widget _buildPantryTile(PantryItem item) {
    Color badgeColor;
    String badgeText = "QTY: ${item.stock}";

    if (item.stock >= 5) {
      badgeColor = Colors.green;
    } else if (item.stock >= 1) {
      badgeColor = Colors.orange;
    } else {
      badgeColor = Colors.red;
      badgeText = "OUT";
    }

    return ListTile(
      title: Text(item.foodName.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(item.category.toUpperCase(), style: const TextStyle(fontSize: 10, letterSpacing: 1)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: badgeColor.withOpacity(0.1),
              border: Border.all(color: badgeColor),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(badgeText, style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () => _showEditModal(item)),
          IconButton(icon: const Icon(Icons.delete_outline, size: 20), onPressed: () => handleDeleteItem(item)),
        ],
      ),
    );
  }

  // Modals for Add/Edit would go here using showModalBottomSheet or showDialog
  void _showAddModal() { /* Implementation similar to your React Add Modal */ }
  
  void _showEditModal(PantryItem item) {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: Text("Edit ${item.foodName}"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(onPressed: () => setModalState(() => item.stock--), icon: const Icon(Icons.remove)),
                  Text("${item.stock}", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  IconButton(onPressed: () => setModalState(() => item.stock++), icon: const Icon(Icons.add)),
                ],
              ),
              TextButton(onPressed: () => setModalState(() => item.stock = 0), child: const Text("Mark as Out of Stock", style: TextStyle(color: Colors.red))),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
            ElevatedButton(onPressed: () { updateStock(item.id, item.stock); Navigator.pop(context); }, child: const Text("Save")),
          ],
        ),
      ),
    );
  }
}