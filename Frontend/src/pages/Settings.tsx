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

  // --- Fetch Data from Backend ---
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

  // --- Handlers ---

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
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Settings</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Household Management</p>
          </div>
        </header>

 <div className="space-y-8">
          {/* Household Info */}
          <section className="border-b border-gray-50 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Household Name</p>
            <div className="flex justify-between items-center">
              {isEditingName ? (
                <input 
                  className="text-xl font-bold text-blue-600 border-b-2 border-blue-500 outline-none bg-transparent w-full mr-4"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  autoFocus
                />
              ) : (
                <p className="text-xl font-bold text-gray-800">{houseName}</p>
              )}
              
              {isAdmin && (
                <button 
                  onClick={() => isEditingName ? handleUpdateName() : setIsEditingName(true)}
                  className="text-blue-600 text-sm font-bold hover:underline"
                >
                  {isEditingName ? "Save" : "Edit"}
                </button>
              )}
            </div>
          </section>

          {/* Invite Code */}
          <section className="border-b border-gray-50 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Invite Code</p>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-mono text-2xl font-bold border border-blue-100">
                {inviteCode}
              </div>
              <button onClick={copyToClipboard} className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-tight">
                Copy Code
              </button>
            </div>
          </section>

          {/* Resident Directory */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Residents</p>
            <div className="grid gap-3">
              {members.map((m) => {
                const fName = m.firstName || (m as any).FirstName || "User";
                return (
                  <div key={m._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {fName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{fName} {m._id === currentUserId && "(You)"}</p>
                        <p className="text-[9px] font-bold text-blue-500 uppercase">{m.role}</p>
                      </div>
                    </div>
                    {isAdmin && m._id !== currentUserId && (
                      <button onClick={() => setMemberToRemove(m)} className="text-gray-300 hover:text-red-500 font-bold p-2">✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Leave Button */}
          <div className="pt-8 flex justify-center">
            <button 
              onClick={() => setShowLeaveModal(true)} 
              className="bg-red-50 text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-100 transition-all text-sm border border-red-100"
            >
              Leave Household
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Leave House?</h2>
            <p className="text-gray-500 text-sm mb-6">You will lose access to the shared pantry.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleRemoveUser(currentUserId, true)} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">Leave</button>
              <button onClick={() => setShowLeaveModal(false)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Remove Member?</h2>
            <p className="text-gray-500 text-sm mb-6">This will revoke their access to the house.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleRemoveUser(memberToRemove._id, false)} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">Remove</button>
              <button onClick={() => setMemberToRemove(null)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
