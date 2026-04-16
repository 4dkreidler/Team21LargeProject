import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/layout.dart';

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
  Map<String, dynamic>? editingItem;

  final nameCtrl = TextEditingController();
  final stockCtrl = TextEditingController(text: "1");
  String category = "General";
  final shoutCtrl = TextEditingController();

  String buildPath(String route) => "http://localhost:5555/$route";

  String get houseID => userData?["houseID"] ?? "";
  String get firstName => userData?["firstName"] ?? "User";
  String get userID => userData?["id"] ?? "";

  String getInitial(String name) =>
      name.isNotEmpty ? name[0].toUpperCase() : "?";

  Color getAvatarColor(String name) {
    const colors = [
      Color(0xFF3B82F6),
      Color(0xFF8B5CF6),
      Color(0xFF10B981),
      Color(0xFFF97316),
      Color(0xFFEC4899),
    ];
    return colors[name.isNotEmpty ? name.length % colors.length : 0];
  }

  List get displayedItems {
    if (viewMode == "all") return items;
    return items.where((i) => i["Stock"] == 0).toList();
  }

  int get outOfStockCount => items.where((i) => i["Stock"] == 0).length;

  // ================= INIT =================
  @override
  void initState() {
    super.initState();
    loadUser();
  }

  @override
  void dispose() {
    nameCtrl.dispose();
    stockCtrl.dispose();
    shoutCtrl.dispose();
    super.dispose();
  }

  Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString("user_data");

    if (stored == null) {
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, "/login", (_) => false);
      return;
    }

    userData = jsonDecode(stored);
    await fetchPantry();
    await fetchNotifications();
    if (mounted) setState(() => isLoading = false);
  }

  // ================= API =================
  Future<void> fetchPantry() async {
    if (houseID.isEmpty) return;
    try {
      final res = await http.get(
          Uri.parse(buildPath("pantry/$houseID?search=$search")));
      final data = jsonDecode(res.body);
      if (mounted) setState(() => items = data["items"] ?? []);
    } catch (e) {
      debugPrint("Pantry fetch error: $e");
    }
  }

  Future<void> fetchNotifications() async {
    if (houseID.isEmpty) return;
    try {
      final res = await http.get(
          Uri.parse(buildPath("api/getNotifications/$houseID")));
      final data = jsonDecode(res.body);
      final list = data is List ? data : data["notifications"] ?? [];
      list.sort((a, b) => DateTime.parse(b["createdAt"])
          .compareTo(DateTime.parse(a["createdAt"])));
      if (mounted) setState(() => notifications = list.take(10).toList());
    } catch (e) {
      debugPrint("Notifications fetch error: $e");
    }
  }

  Future<void> sendActivity(String msg) async {
    try {
      await http.post(
        Uri.parse(buildPath("api/addNotification")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(
            {"houseID": houseID, "userName": firstName, "message": msg}),
      );
      fetchNotifications();
    } catch (e) {
      debugPrint("Activity error: $e");
    }
  }

  Future<void> addItem(String name, int stock, String cat) async {
    try {
      await http.post(
        Uri.parse(buildPath("pantry")),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "foodName": name, "Stock": stock, "Category": cat,
          "houseID": houseID, "userID": userID,
        }),
      );
      sendActivity("added $name to the pantry");
      fetchPantry();
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
      final suffix = stock == 0 ? "as OUT OF STOCK" : "to $stock";
      sendActivity("marked $name $suffix");
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

  // ================= BUILD =================
  @override
  Widget build(BuildContext context) {
    return Layout(
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header ──
                  Text("HOUSE PANTRY",
                      style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0D47A1),
                          letterSpacing: 1)),
                  const SizedBox(height: 2),
                  RichText(
                    text: TextSpan(
                      text: "Welcome, ",
                      style: const TextStyle(
                          color: Color(0xFF6B7280), fontSize: 14),
                      children: [
                        TextSpan(
                            text: "$firstName!",
                            style: const TextStyle(
                                color: Color(0xFF2563EB),
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── Tabs ──
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(child: _tabButton("All Items", "all")),
                        Expanded(
                            child: _tabButton(
                                "Shopping ($outOfStockCount)", "shopping")),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ── Add button ──
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _showAddModal,
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text("Add Item",
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                        elevation: 2,
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── Search ──
                  TextField(
                    decoration: InputDecoration(
                      hintText: "Search pantry...",
                      hintStyle:
                          const TextStyle(color: Color(0xFF9CA3AF)),
                      prefixIcon:
                          const Icon(Icons.search, color: Color(0xFF9CA3AF)),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(
                            color: Color(0xFFF3F4F6), width: 2),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(
                            color: Color(0xFFF3F4F6), width: 2),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(
                            color: Color(0xFF3B82F6), width: 2),
                      ),
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 16),
                    ),
                    onChanged: (val) {
                      search = val;
                      fetchPantry();
                    },
                  ),

                  const SizedBox(height: 16),

                  // ── Item list ──
                  _buildItemList(),

                  const SizedBox(height: 24),

                  // ── Activity Feed ──
                  _buildFeedSection(),

                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  // ================= TABS =================
  Widget _tabButton(String label, String value) {
    final isActive = viewMode == value;
    final isShop = value == "shopping";
    return GestureDetector(
      onTap: () => setState(() => viewMode = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isActive
              ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]
              : [],
        ),
        child: Text(label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: isActive
                  ? (isShop
                      ? const Color(0xFFDC2626)
                      : const Color(0xFF2563EB))
                  : const Color(0xFF6B7280),
            )),
      ),
    );
  }

  // ================= ITEM LIST =================
  Widget _buildItemList() {
    final list = displayedItems;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 2)),
        ],
      ),
      child: list.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(40),
              child: Center(
                  child: Text("No items yet",
                      style: TextStyle(color: Color(0xFF9CA3AF)))),
            )
          : ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Column(
                children: List.generate(list.length, (i) {
                  return Column(
                    children: [
                      if (i > 0)
                        const Divider(
                            height: 1, color: Color(0xFFF3F4F6)),
                      _buildItemRow(list[i]),
                    ],
                  );
                }),
              ),
            ),
    );
  }

  Widget _buildItemRow(Map item) {
    final qty = (item["Stock"] as num?)?.toInt() ?? 0;
    final cat = item["Category"] ?? "General";
    final name = item["foodName"] ?? "";

    Color badgeBg, badgeText, badgeBorder;
    String badgeLabel;
    if (qty >= 5) {
      badgeBg = const Color(0xFFDCFCE7);
      badgeText = const Color(0xFF15803D);
      badgeBorder = const Color(0xFFBBF7D0);
      badgeLabel = "QTY: $qty";
    } else if (qty >= 1) {
      badgeBg = const Color(0xFFFEF9C3);
      badgeText = const Color(0xFFA16207);
      badgeBorder = const Color(0xFFFDE68A);
      badgeLabel = "QTY: $qty";
    } else {
      badgeBg = const Color(0xFFFEE2E2);
      badgeText = const Color(0xFFB91C1C);
      badgeBorder = const Color(0xFFFECACA);
      badgeLabel = "OUT";
    }

    return InkWell(
      onTap: () => _showEditModal(item),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name.toString().toUpperCase(),
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Color(0xFF1F2937))),
                  const SizedBox(height: 2),
                  Text(cat.toString().toUpperCase(),
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF9CA3AF),
                          letterSpacing: 1.5)),
                ],
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: badgeBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: badgeBorder),
              ),
              child: Text(badgeLabel,
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: badgeText)),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => _showEditModal(item),
              child: const Icon(Icons.edit_outlined,
                  size: 20, color: Color(0xFF9CA3AF)),
            ),
            const SizedBox(width: 4),
            GestureDetector(
              onTap: () => _confirmDelete(item),
              child: const Icon(Icons.delete_outline,
                  size: 20, color: Color(0xFFD1D5DB)),
            ),
          ],
        ),
      ),
    );
  }

  // ================= FEED SECTION =================
  Widget _buildFeedSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("HOUSEHOLD FEED",
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0D47A1),
                  letterSpacing: 2)),
          const SizedBox(height: 16),

          // Shout-out input
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: shoutCtrl,
                  decoration: InputDecoration(
                    hintText: "Tell the house something...",
                    hintStyle: const TextStyle(
                        fontSize: 13, color: Color(0xFF9CA3AF)),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide:
                            const BorderSide(color: Color(0xFFF3F4F6))),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide:
                            const BorderSide(color: Color(0xFFF3F4F6))),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                  ),
                  onSubmitted: (val) {
                    if (val.trim().isNotEmpty) {
                      sendActivity(val.trim());
                      shoutCtrl.clear();
                    }
                  },
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () {
                  if (shoutCtrl.text.trim().isNotEmpty) {
                    sendActivity(shoutCtrl.text.trim());
                    shoutCtrl.clear();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text("POST",
                    style: TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 11)),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Notifications
          if (notifications.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(
                  child: Text("No activity yet",
                      style: TextStyle(color: Color(0xFF9CA3AF)))),
            )
          else
            ...notifications.map((n) {
              final name = n["userName"] ?? "User";
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                          color: getAvatarColor(name),
                          shape: BoxShape.circle),
                      child: Center(
                          child: Text(getInitial(name),
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12))),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF9FAFB),
                          borderRadius: const BorderRadius.only(
                            topRight: Radius.circular(16),
                            bottomLeft: Radius.circular(16),
                            bottomRight: Radius.circular(16),
                          ),
                          border: Border.all(
                              color: const Color(0xFFF3F4F6)),
                        ),
                        child: RichText(
                          text: TextSpan(children: [
                            TextSpan(
                                text: "$name ",
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0D47A1),
                                    fontSize: 13)),
                            TextSpan(
                                text: n["message"] ?? "",
                                style: const TextStyle(
                                    color: Color(0xFF374151),
                                    fontSize: 13)),
                          ]),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  // ================= DIALOGS =================
  void _showAddModal() {
    nameCtrl.clear();
    stockCtrl.text = "1";
    category = "General";

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius:
                BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Add New Item",
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0D47A1))),
              const SizedBox(height: 20),
              TextField(
                controller: nameCtrl,
                decoration: InputDecoration(
                  hintText: "Item Name",
                  filled: true,
                  fillColor: const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: stockCtrl,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        hintText: "Qty",
                        filled: true,
                        fillColor: const Color(0xFFF9FAFB),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatefulBuilder(
                      builder: (ctx, setLocal) {
                        return DropdownButtonFormField<String>(
                          value: category,
                          items: ["General", "Dairy", "Produce", "Meat"]
                              .map((c) => DropdownMenuItem(
                                  value: c, child: Text(c)))
                              .toList(),
                          onChanged: (val) {
                            setLocal(() => category = val ?? "General");
                          },
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color(0xFFF9FAFB),
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                                borderSide: BorderSide.none),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        final name = nameCtrl.text.trim();
                        final stock = int.tryParse(stockCtrl.text) ?? 1;
                        if (name.isNotEmpty) {
                          addItem(name, stock, category);
                          Navigator.pop(ctx);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text("Save Item",
                          style:
                              TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xFFF3F4F6),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text("Cancel",
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6B7280))),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showEditModal(Map item) {
    int stock = (item["Stock"] as num?)?.toInt() ?? 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item["foodName"] ?? "Edit Item",
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0D47A1))),
                const SizedBox(height: 20),

                // Quantity control
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Quantity",
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF6B7280))),
                      Row(
                        children: [
                          _circleBtn(Icons.remove, () {
                            if (stock > 0) setLocal(() => stock--);
                          }),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16),
                            child: Text("$stock",
                                style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900)),
                          ),
                          _circleBtn(Icons.add, () {
                            setLocal(() => stock++);
                          }),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Mark out of stock
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () {
                      updateStock(item["_id"], 0, item["foodName"]);
                      Navigator.pop(ctx);
                    },
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xFFFEF2F2),
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text("Mark as Out of Stock",
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFDC2626))),
                  ),
                ),

                const SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          updateStock(
                              item["_id"], stock, item["foodName"]);
                          Navigator.pop(ctx);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(14)),
                          elevation: 4,
                          shadowColor: const Color(0xFF2563EB)
                              .withOpacity(0.3),
                        ),
                        child: const Text("Save Changes",
                            style: TextStyle(
                                fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: TextButton.styleFrom(
                        backgroundColor: const Color(0xFFF3F4F6),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text("Cancel",
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF6B7280))),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _circleBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4),
          ],
        ),
        child: Icon(icon, size: 18, color: const Color(0xFF374151)),
      ),
    );
  }

  void _confirmDelete(Map item) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text("Remove ${item["foodName"]}?"),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel")),
          TextButton(
            onPressed: () {
              deleteItem(item["_id"], item["foodName"]);
              Navigator.pop(context);
            },
            child:
                const Text("Remove", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
