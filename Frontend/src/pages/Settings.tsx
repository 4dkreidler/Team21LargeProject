import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import axios from "axios";
import { buildPath } from '../utils/Path';

interface Member {
  _id: string;
  FirstName: string;
  LastName: string;
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
        const houseRes = await fetch(buildPath(`api/houses/user/${currentUserId}`));
        const houseData = await houseRes.json();

        if (houseData.households && houseData.households.length > 0) {
          const house = houseData.households[0];

          // Debugging log to confirm incoming data
          console.log("DEBUG: House Data from Backend:", house); 

          setHouseId(house._id);
          setHouseName(house.name);
          
          // VERIFIED ADMIN CHECK: Using the 'role' field we found in your console
          setIsAdmin(house.role === "Admin"); 

          // Fetch all members for this specific house
          const membersRes = await fetch(buildPath(`api/houses/${house._id}`));
          const membersData = await membersRes.json();
          setMembers(membersData.members);
          
          // Set invite code if available (using password field as per previous logic)
          if(house.password) setInviteCode(house.password);
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

  // Updates the Household Name on the server
  const handleUpdateName = async () => {
    if (!newHouseName.trim()) return;

    try {
      // Sending the PUT request to the house ID we stored in state
      await fetch(buildPath(`api/houses/${houseId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHouseName
        })
      });

      // If successful, update the UI and close the input
      setHouseName(newHouseName);
      setIsEditingName(false);
    } catch (err) {
      console.error("Update Error:", err);
      // This is the error you were hitting - likely a missing backend route
      alert("Failed to update name. Backend route PUT api/houses/:id might be missing.");
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
        localStorage.removeItem('user_data');
        navigate("/"); 
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
    <div className="min-h-screen bg-gray-50 flex justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 relative">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        </header>

        <div className="space-y-8">
          {/* Household Information */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1">Household Information</p>
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
              <div className="flex-1 mr-4">
                <p className="text-sm text-gray-500">Name</p>
                {isEditingName ? (
                  <input 
                    type="text"
                    className="text-xl font-bold text-blue-600 border-b-2 border-blue-500 outline-none w-full bg-transparent"
                    value={newHouseName}
                    onChange={(e) => setNewHouseName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p className="text-xl font-bold text-gray-800">{houseName}</p>
                )}
              </div>
              
              {/* Only show Edit/Save if user has Admin role */}
              {isAdmin && (
                <div className="flex gap-3">
                  {isEditingName ? (
                    <>
                      <button onClick={handleUpdateName} className="text-green-600 text-sm font-semibold hover:underline">Save</button>
                      <button onClick={() => setIsEditingName(false)} className="text-gray-400 text-sm font-semibold hover:underline">Cancel</button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setNewHouseName(houseName);
                        setIsEditingName(true);
                      }} 
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Invite Code */}
          <section className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500">Invite Code</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono bg-blue-50 px-3 py-1.5 rounded-md text-blue-700 font-bold border border-blue-100">{inviteCode}</span>
              <button onClick={copyToClipboard} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase">Copy</button>
            </div>
          </section>

          {/* Member List */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">Resident Directory</p>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m._id} className="flex justify-between items-center bg-gray-50 px-5 py-4 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">{m.FirstName?.[0]}</div>
                    <div>
                      <p className="font-bold text-gray-900">{m.FirstName} {m._id === currentUserId && "(You)"}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">{m.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Admin can remove others, but not themselves here */}
                    {isAdmin && m._id !== currentUserId && (
                      <button onClick={() => setMemberToRemove(m)} className="text-gray-300 hover:text-red-500 p-2 font-bold">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leave Button */}
          <div className="pt-10 flex justify-center">
            <button 
              onClick={() => setShowLeaveModal(true)} 
              className="px-8 py-3 bg-red-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-red-700 transition-all"
            >
              Leave House
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Leave House Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Are you sure?</h2>
            <p className="text-gray-500 text-sm mb-8">You will lose access to this household's pantry.</p>
            <div className="space-y-3">
              <button onClick={() => handleRemoveUser(currentUserId, true)} className="w-full py-4 bg-red-500 text-white rounded-full font-bold">Yes, Leave</button>
              <button onClick={() => setShowLeaveModal(false)} className="w-full py-4 bg-gray-200 text-gray-700 rounded-full font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Remove {memberToRemove.FirstName}?</h2>
            <p className="text-gray-500 text-xs mb-8">They will need a new code to rejoin.</p>
            <div className="space-y-3">
              <button onClick={() => handleRemoveUser(memberToRemove._id, false)} className="w-full py-4 bg-red-500 text-white rounded-full font-bold">Remove Resident</button>
              <button onClick={() => setMemberToRemove(null)} className="w-full py-4 bg-gray-200 text-gray-700 rounded-full font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;