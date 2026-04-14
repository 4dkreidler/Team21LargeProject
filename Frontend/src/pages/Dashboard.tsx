import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { buildPath } from '../utils/Path'; 

interface PantryItem {
    _id: string;
    foodName: string;
    Stock: number;
    houseID: string;
    Category?: string;
}

interface Notification {
    _id: string;
    houseID: string;
    userName: string;
    message: string;
    createdAt: number | string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // Auth Check
    if (!localStorage.getItem('user_data')) {
        window.location.href = "/"; 
    }

    const [items, setItems] = useState<PantryItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"all" | "shopping">("all");
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ foodName: "", Stock: 1, Category: "General" });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const houseID = userData.houseID;
    const firstName = userData.firstName || "User";
    const userID = userData.id;

    // --- UTILS: AVATAR LOGIC ---
    const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "?");
    const getAvatarColor = (name: string) => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'];
        const index = name ? name.length % colors.length : 0;
        return colors[index];
    };

    // --- API: FETCH NOTIFICATIONS ---
    const fetchNotifications = async () => {
        if (!houseID) return;
        try {
            const response = await fetch(buildPath(`api/getNotifications/${houseID}`));
            if (response.ok) {
                const data = await response.json();
                // Sorting by newest first
                const sorted = (data.notifications || []).sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setNotifications(sorted.slice(0, 10)); 
            }
        } catch (e) {
            console.error("Fetch notifications error:", e);
        }
    };

    // --- API: SEND NOTIFICATION ---
    const sendActivity = async (message: string) => {
        if (!houseID) return;
        try {
            await fetch(buildPath(`api/addNotification`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    houseID,
                    userName: firstName,
                    message
                })
            });
            fetchNotifications(); 
        } catch (e) {
            console.error("Activity log error:", e);
        }
    };

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

        try {
            const response = await fetch(buildPath(`pantry`), {
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
                sendActivity(`added ${newItem.foodName} to the pantry`);
                setShowModal(false); 
                setNewItem({ foodName: "", Stock: 1, Category: "General" }); 
                fetchPantry(); 
            }
        } catch (err) { console.error("Add Item Error:", err); }
    };

    const updateStock = async (itemID: string, newStock: number, itemName: string) => {
        try {
            const response = await fetch(buildPath(`pantry/${itemID}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Stock: newStock, userID: userID })
            });

            if (response.ok) {
                const status = newStock === 0 ? "marked" : "updated";
                const suffix = newStock === 0 ? "as OUT" : `to ${newStock}`;
                sendActivity(`${status} ${itemName} ${suffix}`);
                
                setItems(prev => prev.map(item => 
                    item._id === itemID ? { ...item, Stock: newStock } : item
                ));
            }
        } catch (err) { console.error("Update error:", err); }
    };

    const handleDeleteItem = async (itemID: string, foodName: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove ${foodName}?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(buildPath(`pantry/${itemID}`), { method: "DELETE" });
            if (response.ok) {
                sendActivity(`removed ${foodName} from the pantry`);
                setItems(prevItems => prevItems.filter(item => item._id !== itemID));
            }
        } catch (err) { console.error("Delete Error:", err); }
    };

    useEffect(() => {
        fetchPantry();
        fetchNotifications();
        // Poll for new messages every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [search, houseID]); 

    const displayedItems = viewMode === "all" ? items : items.filter(item => item.Stock === 0);

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT SIDE: PANTRY LIST (7/12) */}
                <div className="lg:col-span-7">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/settings")} className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all group">
                                <span className="text-lg group-hover:rotate-90 transition-transform inline-block">⚙️</span>
                            </button>
                            <div>
                                <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight uppercase">House Pantry</h1>
                                <p className="text-gray-500">Welcome, <span className="text-blue-600 font-bold">{firstName}</span>!</p>
                            </div>
                        </div>
                        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
                            + Add Item
                        </button>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                        <button onClick={() => setViewMode("all")} className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>All Items</button>
                        <button onClick={() => setViewMode("shopping")} className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'shopping' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>
                            Shopping ({items.filter(i => i.Stock === 0).length})
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <input type="text" placeholder="Search pantry..." className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {displayedItems.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {displayedItems.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 uppercase text-lg">{item.foodName}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.Category || "General"}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${item.Stock >= 5 ? 'bg-green-100 text-green-700' : item.Stock >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.Stock === 0 ? "OUT" : `QTY: ${item.Stock}`}
                                            </span>
                                            <button onClick={() => { setEditingItem(item); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-blue-500 hover:scale-110 transition-all">🖊️</button>
                                            <button onClick={() => handleDeleteItem(item._id, item.foodName)} className="p-2 text-gray-300 hover:text-red-500 hover:scale-110 transition-all">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-400 font-medium italic">Empty pantry!</div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: HOUSEHOLD FEED (5/12) */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Household Feed</h2>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('shoutout') as HTMLInputElement;
                            if (input.value.trim()) {
                                sendActivity(input.value);
                                input.value = "";
                            }
                        }} className="mb-8">
                            <div className="relative">
                                <input required name="shoutout" type="text" placeholder="Tell the house something..." className="w-full p-4 pr-16 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500/20 shadow-inner" />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
                                    <span className="text-xs font-bold uppercase tracking-widest">Post</span>
                                </button>
                            </div>
                        </form>

                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                            {notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <div key={note._id} className="flex gap-4 items-start">
                                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(note.userName)} text-white flex items-center justify-center font-black text-sm shrink-0`}>
                                            {getInitial(note.userName)}
                                        </div>
                                        <div>
                                            <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-bold text-blue-900">{note.userName}</span> {note.message}
                                                </p>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-black uppercase mt-1.5 ml-1">
                                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 text-sm italic">No activity yet...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6">Add New Item</h2>
                        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                            <input required className="w-full p-3 bg-gray-50 border rounded-xl" placeholder="Item Name" value={newItem.foodName} onChange={(e) => setNewItem({...newItem, foodName: e.target.value})} />
                            <div className="flex gap-4">
                                <input type="number" min="0" className="w-full p-3 bg-gray-50 border rounded-xl" value={newItem.Stock} onChange={(e) => setNewItem({...newItem, Stock: parseInt(e.target.value) || 0})} />
                                <select className="w-full p-3 bg-gray-50 border rounded-xl" value={newItem.Category} onChange={(e) => setNewItem({...newItem, Category: e.target.value})}>
                                    <option>General</option><option>Dairy</option><option>Produce</option><option>Meat</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Save</button>
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
                            <input className="w-full p-3 bg-gray-50 border rounded-xl" value={editingItem.foodName} onChange={(e) => setEditingItem({...editingItem, foodName: e.target.value})} />
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                                <span className="font-bold text-gray-600">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setEditingItem({...editingItem, Stock: Math.max(0, editingItem.Stock - 1)})} className="w-10 h-10 bg-white rounded-full border">-</button>
                                    <span className="font-black text-xl">{editingItem.Stock}</span>
                                    <button onClick={() => setEditingItem({...editingItem, Stock: editingItem.Stock + 1})} className="w-10 h-10 bg-white rounded-full border">+</button>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => { updateStock(editingItem._id, editingItem.Stock, editingItem.foodName); setShowEditModal(false); }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">Save</button>
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