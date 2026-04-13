import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Navigation hook
import { Layout } from "../components/Layout";
import { buildPath } from '../utils/Path'; 

interface PantryItem {
    _id: string;
    foodName: string;
    Stock: number;
    houseID: string;
    Category?: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // Auth Check
    if (!localStorage.getItem('user_data')) {
        window.location.href = "/"; 
    }

    const [items, setItems] = useState<PantryItem[]>([]);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"all" | "shopping">("all");
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        foodName: "",
        Stock: 1,
        Category: "General"
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const houseID = userData.houseID;
    const firstName = userData.firstName || "User";
    const userID = userData.id;

    const fetchPantry = async () => {
        if (!houseID) return;
        const url = buildPath(`pantry/${houseID}?search=${search}`);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setItems(data.items || []);
            }
        } catch (e) { 
            console.error("Fetch error:", e); 
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!houseID || !userID) return;

        const url = buildPath(`pantry`); 
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    foodName: newItem.foodName,
                    Stock: Number(newItem.Stock),
                    Category: newItem.Category,
                    houseID: houseID,
                    userID: userID
                })
            });

            if (response.ok) {
                setShowModal(false); 
                setNewItem({ foodName: "", Stock: 1, Category: "General" }); 
                fetchPantry(); 
            }
        } catch (err) {
            console.error("Add Item Error:", err);
        }
    };

    const handleDeleteItem = async (itemID: string, foodName: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove ${foodName}?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(buildPath(`pantry/${itemID}`), { method: "DELETE" });
            if (response.ok) {
                setItems(prevItems => prevItems.filter(item => item._id !== itemID));
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const updateStock = async (itemID: string, newStock: number) => {
        try {
            const url = buildPath(`pantry/${itemID}`);
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Stock: newStock, userID: userID })
            });

            if (response.ok) {
                setItems(prev => prev.map(item => 
                    item._id === itemID ? { ...item, Stock: newStock } : item
                ));
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    useEffect(() => {
        fetchPantry();
    }, [search, houseID]); 

    const displayedItems = viewMode === "all" 
        ? items 
        : items.filter(item => item.Stock === 0);

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        {/* SETTINGS BUTTON (Moved to left next to Title) */}
                        <button 
                            onClick={() => navigate("/settings")}
                            className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all group"
                            title="Household Settings"
                        >
                            <span className="text-lg group-hover:rotate-90 transition-transform inline-block">⚙️</span>
                        </button>

                        <div>
                            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight uppercase">House Pantry</h1>
                            <p className="text-gray-500">Welcome, <span className="text-blue-600 font-bold">{firstName}</span>!</p>
                        </div>
                    </div>
                    
                    {/* ADD ITEM BUTTON */}
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 z-10"
                    >
                        + Add Item
                    </button>
                </div>

                {/* VIEW TOGGLE */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                    <button onClick={() => setViewMode("all")} className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>All Items</button>
                    <button onClick={() => setViewMode("shopping")} className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'shopping' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>
                        Shopping List ({items.filter(i => i.Stock === 0).length})
                    </button>
                </div>

                {/* SEARCH */}
                <div className="relative mb-8">
                    <input 
                        type="text"
                        placeholder="Search pantry..."
                        className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                {/* ITEMS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {displayedItems.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {displayedItems.map((item) => {
                                // --- COLOR LOGIC ---
                                const qty = Number(item.Stock);
                                let badgeClass = "";
                                let badgeText = `QTY: ${qty}`;

                                if (qty >= 5) {
                                    badgeClass = "bg-green-100 text-green-700 border-green-200";
                                } else if (qty >= 1) {
                                    badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
                                } else if (qty === 0) {
                                    badgeClass = "bg-red-100 text-red-700 border-red-200";
                                    badgeText = "OUT";
                                } else {
                                    badgeClass = "bg-gray-100 text-gray-400 border-gray-200";
                                    badgeText = "INVALID";
                                }

                                return (
                                    <div key={item._id} className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 uppercase text-lg">{item.foodName}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.Category || "General"}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* DYNAMIC BADGE */}
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${badgeClass}`}>
                                                {badgeText}
                                            </span>

                                            <button onClick={() => { setEditingItem(item); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-blue-500 hover:scale-110 transition-all">🖊️</button>
                                            <button onClick={() => handleDeleteItem(item._id, item.foodName)} className="p-2 text-gray-300 hover:text-red-500 hover:scale-110 transition-all">🗑️</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-400 font-medium">
                            {viewMode === "all" ? "No items found in your pantry." : "Your shopping list is empty!"}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6">Add New Item</h2>
                        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                            <input 
                                required
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500"
                                placeholder="Item Name"
                                value={newItem.foodName}
                                onChange={(e) => setNewItem({...newItem, foodName: e.target.value})}
                            />
                            <div className="flex gap-4">
                                <input 
                                    type="number"
                                    min="0"
                                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500"
                                    value={newItem.Stock}
                                    onChange={(e) => setNewItem({...newItem, Stock: parseInt(e.target.value) || 0})}
                                />
                                <select 
                                    className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
                                    value={newItem.Category}
                                    onChange={(e) => setNewItem({...newItem, Category: e.target.value})}
                                >
                                    <option>General</option>
                                    <option>Dairy</option>
                                    <option>Produce</option>
                                    <option>Meat</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Save Item</button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6">Edit Item</h2>
                        <div className="flex flex-col gap-5">
                            <input 
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500"
                                value={editingItem.foodName}
                                onChange={(e) => setEditingItem({...editingItem, foodName: e.target.value})}
                            />
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                                <span className="font-bold text-gray-600">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setEditingItem({...editingItem, Stock: Math.max(-1, editingItem.Stock - 1)})} className="w-10 h-10 bg-white rounded-full shadow-sm font-bold border hover:bg-gray-50">-</button>
                                    <span className="font-black text-xl min-w-[30px] text-center">{editingItem.Stock}</span>
                                    <button onClick={() => setEditingItem({...editingItem, Stock: editingItem.Stock + 1})} className="w-10 h-10 bg-white rounded-full shadow-sm font-bold border hover:bg-gray-50">+</button>
                                </div>
                            </div>
                            <button onClick={() => setEditingItem({...editingItem, Stock: 0})} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">Mark as Out of Stock</button>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={() => { updateStock(editingItem._id, editingItem.Stock); setShowEditModal(false); }}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                >
                                    Save Changes
                                </button>
                                <button onClick={() => setShowEditModal(false)} className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;