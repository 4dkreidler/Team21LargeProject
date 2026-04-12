import React, { useState, useEffect } from "react";
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
    const [items, setItems] = useState<PantryItem[]>([]);
    const [search, setSearch] = useState("");
    
// --- NEW STATE FOR ADD ITEM ---
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        foodName: "",
        Stock: 1,
        Category: "General"
    });

    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const houseID = userData.houseID;
    const firstName = userData.firstName || "User";
    const userID = userData.id;

 const fetchPantry = async () => {
    if (!houseID) return;
    const url = buildPath(`pantry/${houseID}?search=${search}`);
    try {
        const response = await fetch(url);
        // Safety: only parse if the response is actually OK
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
    
    // Safety check: ensure we have the IDs needed
    if (!houseID || !userID) {
        alert("Session error: Please log out and log back in.");
        return;
    }

    const url = buildPath(`pantry`); 
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                foodName: newItem.foodName,
                Stock: Number(newItem.Stock), // Ensure this is a Number
                Category: newItem.Category,
                houseID: houseID,
                userID: userID
            })
        });

        // Check if response is actually JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (response.ok) {
                setShowModal(false); 
                setNewItem({ foodName: "", Stock: 1, Category: "General" }); 
                fetchPantry(); 
            } else {
                alert(data.message || "Error adding item");
            }
        } else {
            console.error("Server did not return JSON");
        }
    } catch (err) {
        console.error("Add Item Error:", err);
    }
};

const handleDeleteItem = async (itemID: string, foodName: string) => {
    // 1. Browser confirmation pop-up
    const confirmDelete = window.confirm(`Are you sure you want to remove ${foodName} from the pantry?`);
    if (!confirmDelete) return;

    // 2. Build the URL (e.g., /pantry/65f...)
    const url = buildPath(`pantry/${itemID}`);
    
    try {
        const response = await fetch(url, {
            method: "DELETE" // Matches your app.delete route
        });

        if (response.ok) {
            // 3. Optimized UI Update: Remove the item from state locally
            // This makes the app feel "instant"
            setItems(prevItems => prevItems.filter(item => item._id !== itemID));
        } else {
            const data = await response.json();
            alert(data.message || "Failed to delete item.");
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("An error occurred while deleting.");
    }
};

    useEffect(() => {
        fetchPantry();
    }, [search, houseID]); 

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-blue-900">HOUSE PANTRY</h1>
                        <p className="text-gray-500">Welcome, <span className="text-blue-600 font-bold">{firstName}</span>!</p>
                    </div>
                    
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 z-10"
                    >
                        + Add Item
                    </button>
                </div>
                
                {/* SEARCH BAR */}
                <div className="relative mb-8 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        🔍
                    </span>
                    <input 
                        type="text"
                        placeholder="Search pantry (e.g. 'milk')..."
                        className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* ITEMS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {items.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800 uppercase tracking-tight">
                                            {item.foodName}
                                        </span>
                                        <span className="text-xs text-gray-400">Inventory Item</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                                            Qty: {item.Stock}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteItem(item._id, item.foodName)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-gray-400 font-medium">No items found in your pantry.</p>
                            <p className="text-xs text-gray-300 mt-1">Try a different search or add a new item!</p>
                        </div>
                    )}
                </div>
            </div>
            {/* --- ADD ITEM MODAL --- */}
{showModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Add New Item</h2>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Item Name</label>
                    <input 
                        required
                        className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-blue-500"
                        value={newItem.foodName}
                        onChange={(e) => setNewItem({...newItem, foodName: e.target.value})}
                        placeholder="e.g. Milk"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Quantity</label>
                        <input 
                            type="number"
                            min="1"
                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
                            value={newItem.Stock}
                            onChange={(e) => setNewItem({...newItem, Stock: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
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
                </div>
                <div className="flex gap-3 mt-4">
                    <button 
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Save Item
                    </button>
                    <button 
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
        </Layout>
    );
};

export default Dashboard;