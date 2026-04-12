import React, { useState } from "react";
import PantryCalendar from "./PantryCalendar.tsx";
import "./Dashboard.css";

type Task = {
  id: number;
  text: string;
  done: boolean;
};

type Roommate = {
  name: string;
  status: "active" | "away" | "offline";
  lastSeen?: string;
};

type GroceryItem = {
  id: number;
  text: string;
  emoji: string;
  done: boolean;
};

export default function Dashboard() {

  const [activeTab, setActiveTab] = useState<string>("home");
  const [hasHousehold, setHasHousehold] = useState(true);

  const [settingsModal, setSettingsModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const householdCode = "DORM316-9XQ2";

  const copyCode = () => {
    navigator.clipboard.writeText(householdCode);
  };

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Clean fridge", done: false },
    { id: 2, text: "Restock snacks", done: false },
    { id: 3, text: "Take out trash", done: true }
  ]);

  const [roommates] = useState<Roommate[]>([
    { name: "Alex", status: "active" },
    { name: "Jordan", status: "away", lastSeen: "2 hrs ago" },
    { name: "Taylor", status: "offline", lastSeen: "2 hrs ago" }
  ]);

  const [groceryList, setGroceryList] = useState<GroceryItem[]>([
    { id: 1, text: "Milk", emoji: "🥛", done: false },
    { id: 2, text: "Eggs", emoji: "🥚", done: false },
    { id: 3, text: "Pizza", emoji: "🍕", done: false },
    { id: 4, text: "Apples", emoji: "🍎", done: false }
  ]);

  const [modal, setModal] = useState<"confirm" | "add" | null>(null);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [activity] = useState([
    { name: "Jordan", text: "added Pasta", time: "10m ago" },
    { name: "You", text: "marked Milk as low", time: "2h ago" },
    { name: "Alex", text: "planned Movie Night", time: "1d ago" },
    { name: "Jordan", text: "completed 'Take out trash'", time: "2d ago" },
  ]);

  // =========================
  // TASKS
  // =========================
  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // =========================
  // GROCERY (FIXED)
  // =========================

  const toggleGroceryItem = (id: number) => {
    setGroceryList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const confirmRemove = () => {
    if (!selectedItem) return;

    setGroceryList(prev =>
      prev.map(item =>
        item.id === selectedItem.id ? { ...item, done: true } : item
      )
    );

    setSelectedItem(null);
    setModal(null);
  };

  const restoreItem = (id: number) => {
    setGroceryList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, done: false } : item
      )
    );
  };

  const getEmoji = (text: string) => {
    const t = text.toLowerCase();

    if (t.includes("milk")) return "🥛";
    if (t.includes("egg")) return "🥚";
    if (t.includes("bread")) return "🍞";
    if (t.includes("rice")) return "🍚";
    if (t.includes("pizza")) return "🍕";
    if (t.includes("taco")) return "🌮";
    if (t.includes("avocado")) return "🥑";
    if (t.includes("corn")) return "🌽";
    if (t.includes("tomato")) return "🍅";
    if (t.includes("banana")) return "🍌";
    if (t.includes("cheese")) return "🧀";

    return "🛒";
  };

  const addNewItem = () => {
    if (!newItemText.trim()) return;

    const newItem: GroceryItem = {
      id: Date.now(),
      text: newItemText,
      emoji: getEmoji(newItemText),
      done: false
    };

    setGroceryList(prev => [newItem, ...prev]);
    setNewItemText("");
    setModal(null);
  };

  const leaveHousehold = () => {
    setHasHousehold(false);
    setSettingsModal(false);
    setActiveTab("home");
  };

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
            className="bag-icon-img"
            alt="logo"
          />
          <div className="brand-text">Parcel Pantry</div>
        </div>

        <div className="sidebar-nav">
          {["home", "pantry", "tasks"].map(tab => (
            <p
              key={tab}
              className={activeTab === tab ? "active-tab" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </p>
          ))}
        </div>

        <div className="sidebar-bottom">
          <p
            className={activeTab === "settings" ? "active-tab" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <h1>Welcome, User 👋</h1>
            <small>Dorm 316</small>
          </div>

          <button className="logout-btn" onClick={() => setLogoutModal(true)}>
            Logout
          </button>
        </div>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="grid">

            <div className="card roommates-card">
              <h3>Roommates</h3>

              <div className="roommates-row">
                {roommates.map((r, i) => (
                  <div key={i} className="roommate-pill">
                    <div className={`avatar ${r.status}`}>
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="roommate-info">
                      <div className="roommate-name">{r.name}</div>
                      <div className="roommate-status">
                        <span className={`status-dot ${r.status}`} />
                        <span>
                          {r.status === "offline"
                            ? `Last seen ${r.lastSeen}`
                            : r.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>🔔 Recent Activity</h3>

              {activity.slice(0, 4).map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-left">
                    <div className="activity-avatar">
                      {a.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <span><b>{a.name}</b> {a.text}</span>
                    </div>
                  </div>
                  <div className="activity-time">{a.time}</div>
                </div>
              ))}

              <button
                className="light-btn full-width"
                onClick={() => setActivityModal(true)}
              >
                View all Activity
              </button>
            </div>

            <div className="card full">
              <h3>Pantry Calendar 📅</h3>
              <PantryCalendar />
            </div>

          </div>
        )}

        {/* TASKS */}
        {activeTab === "tasks" && (
          <div className="card">
            <h3>Tasks</h3>
            {tasks.map(task => (
              <div key={task.id} className="item">
                <span>{task.text}</span>
                <button className="light-btn" onClick={() => toggleTask(task.id)}>
                  {task.done ? "✅" : "⬜"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PANTRY */}
        {activeTab === "pantry" && (
          <div className="card">

            <div className="grocery-header">
              <h3>Grocery List 🛒</h3>

              <div className="header-buttons">
                <button className="add-btn" onClick={() => setModal("add")}>
                  Add Item +
                </button>

                <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
                  ✏️ Edit
                </button>
              </div>
            </div>

            {/* ACTIVE */}
            {groceryList.filter(i => !i.done).map(item => (
              <div key={item.id} className="item">
                <span
                  className="grocery-item"
                  onClick={() => toggleGroceryItem(item.id)}
                >
                  {item.emoji} {item.text}
                </span>
              </div>
            ))}

            {/* DONE */}
            {groceryList.filter(i => i.done).map(item => (
              <div key={item.id} className="item">
                <span className="done">
                  {item.emoji} {item.text}
                </span>

                {editMode && (
                  <button
                    className="light-btn"
                    onClick={() => restoreItem(item.id)}
                  >
                    Undo
                  </button>
                )}
              </div>
            ))}

          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="settings-page">
            <h2>Settings ⚙️</h2>

            <button className="danger-btn" onClick={() => setSettingsModal(true)}>
              Leave this Household
            </button>

            <button className="light-btn" onClick={() => setInviteModal(true)}>
              🤝 Invite to Household
            </button>

            <button
              className="light-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        )}

      </div>

      {/* MODALS */}
      {modal === "confirm" && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Remove item?</h3>
            <button className="green-btn" onClick={confirmRemove}>Yes</button>
            <button className="light-btn" onClick={() => setModal(null)}>No</button>
          </div>
        </div>
      )}

      {modal === "add" && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Item</h3>
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button className="green-btn" onClick={addNewItem}>Add</button>
          </div>
        </div>
      )}

      {logoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Logout?</h3>
            <button className="danger-btn" onClick={() => setLogoutModal(false)}>Yes</button>
            <button className="light-btn" onClick={() => setLogoutModal(false)}>No</button>
          </div>
        </div>
      )}

      {settingsModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Leave household?</h3>
            <button className="danger-btn" onClick={leaveHousehold}>Yes</button>
            <button className="light-btn" onClick={() => setSettingsModal(false)}>No</button>
          </div>
        </div>
      )}

      {activityModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>All Activity</h3>
            {activity.map((a, i) => (
              <div key={i} className="item">
                <span><b>{a.name}</b> {a.text}</span>
                <span style={{ fontSize: "12px", color: "#888" }}>{a.time}</span>
              </div>
            ))}
            <button className="light-btn" onClick={() => setActivityModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {inviteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Dorm 316’s Code</h3>
            <div style={{ background: "#fff", padding: 10, borderRadius: 8 }}>
              <span>{householdCode}</span>
              <button className="light-btn" onClick={copyCode}>📋</button>
            </div>
            <button className="light-btn" onClick={() => setInviteModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}