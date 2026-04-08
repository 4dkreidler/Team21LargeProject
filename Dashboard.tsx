import React from "react";
import PantryCalendar from "./PantryCalendar"; // simple placeholder for now

type User = {
  name: string;
};

export default function Dashboard() {
  const user: User = { name: "User" }; // temporary placeholder will change once we get backend (user's name) from imi and miah
{/* giving the highest priority notifs that need immediate attn */}
  return (
    <div className="dashboard" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* HEADER */}
      <div className="header" style={{ marginBottom: "20px" }}>
        <h1>Welcome back, {user.name} 👋</h1>
        <p>🏡 Parcel Pantry • 3 items running low • 2 tasks pending</p>
      </div>

      {/* GRID */}
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <div className="card" style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
          <h2>🧺 Pantry Snapshot</h2>
          <p>Milk — Low</p>
          <p>Eggs — Out</p>
          <p>Pasta — Good</p>
          <button>+ Add Item</button>
        </div>
{/* Current tasks for user to do/already done */}
        <div className="card" style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
          <h2>✅ Tasks</h2>
          <p>⬜ Buy groceries</p>
          <p>⬜ Clean kitchen</p>
          <p>✅ Take out trash</p>
        </div>
            {/* These are sample activity notifs, once getting backend connection from team will update so that all notifs from a certain housecode come in*/}
        <div className="card" style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
          <h2>🔔 Activity</h2>
          <p>John added Pasta</p>
          <p>You marked Milk as low</p>
          <p>Ana planned Movie Night 🎬</p>
        </div>
{/* This is a stretch but if i can implement it'll be amaze, calendar that user can click on to get important dates regarding household tasks, items running low, events, possibly household members bdays (a stretch)*/}
        <div className="card" style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px" }}>
          <h2>📅 Calendar</h2>
          <PantryCalendar />
        </div>
            {/* Quick Actions tabs, will prob add more need to ask */}
        <div className="card full" style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "10px", gridColumn: "1 / -1" }}> 
          <h2>⚡ Quick Actions</h2>
          <div className="actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button>+ Add Item</button>
            <button>🛒 Grocery List</button>
            <button>📅 Plan Event</button>
          </div>
        </div>
      </div>
    </div>
  );
}