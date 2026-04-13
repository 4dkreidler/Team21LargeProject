import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildPath } from '../utils/Path';

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Member";
}

const Settings: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  const [houseId, setHouseId] = useState("");
  const [houseName, setHouseName] = useState("Loading...");
  const [inviteCode, setInviteCode] = useState("------");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // States for editing the household name
  const [isEditingName, setIsEditingName] = useState(false);
  const [newHouseName, setNewHouseName] = useState("");

  // Modals State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  // Pull user data from Local Storage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const currentUserId = userData.id;

  // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch house info for current user
        const houseRes = await fetch(buildPath(`api/houses/user/${currentUserId}`));
        const houseData = await houseRes.json();

        if (houseData.households && houseData.households.length > 0) {
          const house = houseData.households[0];

          setHouseId(house._id);
          setHouseName(house.name);
          
          // Determine if user is Admin
          setIsAdmin(house.role === "Admin"); 

          // Fetch all members for this specific house
          const membersRes = await fetch(buildPath(`api/houses/${house._id}`));
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
          
          // Logic to catch the invite code from the backend
          const code = house.inviteCode || house.code || house.password;
          if (code) {
            setInviteCode(code);
          } else {
            setInviteCode("N/A");
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading settings:", err);
        setLoading(false);
      }
    };

    if (currentUserId) fetchAllData();
  }, [currentUserId]);

  // --- 2. Handlers ---

  const handleUpdateName = async () => {
    if (!newHouseName.trim()) return;

    try {
      // Calling our new POST route
      const response = await fetch(buildPath(`api/houses/update`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          houseID: houseId, 
          newName: newHouseName 
        })
      });

      if (response.ok) {
        setHouseName(newHouseName);
        setIsEditingName(false);
        alert("Name updated successfully!");
      } else {
        const data = await response.json();
        alert("Error: " + (data.error || "Failed to update"));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to connect to server.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    alert("Invite code copied to clipboard!");
  };

  const handleRemoveUser = async (userId: string, isSelf: boolean) => {
    try {
      await fetch(buildPath(`api/houses/${userId}`), {
        method: "DELETE"
      });

      if (isSelf) {
        navigate("/home"); 
      } else {
        setMembers(prev => prev.filter(m => m._id !== userId));
        setMemberToRemove(null);
      }
    } catch (err) {
      alert("Failed to remove user. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading household settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 md:p-12 relative h-fit">
        
        <header className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Household Management</p>
          </div>
        </header>

        <div className="space-y-10">
          {/* Household Name Section */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pantry Name</p>
                {isEditingName ? (
                  <input 
                    type="text"
                    className="text-2xl font-black text-blue-600 bg-white border-2 border-blue-500 rounded-lg px-3 py-1 outline-none w-full shadow-lg shadow-blue-100"
                    value={newHouseName}
                    onChange={(e) => setNewHouseName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p className="text-2xl font-black text-slate-800">{houseName}</p>
                )}
              </div>
              
              {isAdmin && (
                <div className="ml-4">
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <button onClick={handleUpdateName} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">Save</button>
                      <button onClick={() => setIsEditingName(false)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-300">Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setNewHouseName(houseName);
                        setIsEditingName(true);
                      }} 
                      className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-all"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Invite Code Section */}
          <section className="px-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Invite Code</p>
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-inner shadow-black/20 font-mono text-3xl font-black tracking-widest">
                {inviteCode}
              </div>
              <button 
                onClick={copyToClipboard} 
                className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
              >
                Copy Code
              </button>
            </div>
            <p className="text-slate-400 text-[11px] mt-3 font-medium">Roommates use this code to join your shared kitchen data.</p>
          </section>

          {/* Members List */}
          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Residents</p>
            <div className="grid gap-3">
              {members.map((m) => {
                const fName = m.firstName || (m as any).FirstName || "Unknown";
                return (
                  <div key={m._id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md hover:shadow-slate-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-lg">
                        {fName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-tight">
                          {fName} {m._id === currentUserId && <span className="text-blue-500 ml-1">(You)</span>}
                        </p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${m.role === 'Admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                          {m.role}
                        </span>
                      </div>
                    </div>
                    
                    {isAdmin && m._id !== currentUserId && (
                      <button 
                        onClick={() => setMemberToRemove(m)} 
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dangerous Zone */}
          <div className="pt-6 border-t border-slate-100 flex justify-center">
            <button 
              onClick={() => setShowLeaveModal(true)} 
              className="text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              Leave Household
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">!</div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">Leave House?</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed">You will lose all access to the pantry and shared shopping lists.</p>
            <div className="space-y-3">
              <button onClick={() => handleRemoveUser(currentUserId, true)} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all">Yes, Leave</button>
              <button onClick={() => setShowLeaveModal(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {memberToRemove && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-2 text-slate-900">Remove Member?</h2>
            <p className="text-slate-500 text-sm mb-10">This will revoke their access immediately.</p>
            <div className="space-y-3">
              <button onClick={() => handleRemoveUser(memberToRemove._id, false)} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600">Confirm Removal</button>
              <button onClick={() => setMemberToRemove(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;