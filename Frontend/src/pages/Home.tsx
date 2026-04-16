import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { buildPath } from "../utils/Path";

interface Household {
  _id: string;
  name: string;
  role: string;
}

const Home: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleCreateHouse = async () => {
    const houseName = prompt("Enter a name for your Household:");
    if (!houseName) return;

    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = storedUser.id;

    try {
      const response = await fetch(buildPath('api/houses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Admin: userId,
          HouseName: houseName
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        const newHouseEntry = {
          _id: data.user.houseID,
          name: houseName,
          role: "Admin"
        };
        setHouseholds([newHouseEntry]);
        setGeneratedCode(data.house.password);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Creation Error:", err);
    }
  };

  const handleJoinHouse = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = storedUser.id;

    try {
      const response = await fetch(buildPath('api/houses/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: userId,
          password: inviteCode 
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        const userUpdate = { ...storedUser, houseID: data.user.houseID };
        localStorage.setItem('user_data', JSON.stringify(userUpdate));
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Join Error:", err);
    }
  };

  const fetchMyHouses = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userId = storedUser.id;

  if (!userId) return;

  try {
    // Matches the logic in houseManager to fetch households for a user
    const response = await fetch(buildPath(`api/houses/user/${userId}`));
    const data = await response.json();

    if (data.households) {
      setHouseholds(data.households);
    }
  } catch (err) {
    console.error("Error fetching households:", err);
  } finally {
    setLoading(false);
  }
};

const handleSelectHouse = (houseID: string) => {
  const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  // Update the stored user object with this specific houseID
  const userUpdate = { ...storedUser, houseID: houseID };
  localStorage.setItem('user_data', JSON.stringify(userUpdate));
  
  // Navigate to the dashboard
  window.location.href = "/dashboard";
};

  useEffect(() => {
    const fetchMyHouse = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      if (!storedUser.id || storedUser.houseID === '-1') {
        setHouseholds([]);
        setLoading(false);
      return;
      }
        
      try {
        const url= buildPath(`api/houses/user/${storedUser.id}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.households) {
          setHouseholds(data.households);
        }
      } catch (err) {
        console.error(err);
        console.log("No households found for this user:", storedUser.id);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHouse();
  }, []);

const finishCreate = () => {
    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    // Dashboard can find houseID from localStorage
    window.location.href = "/dashboard";
  };

  return (
    <Layout>
      <div className="max-w-5xl w-full px-6 py-12 flex flex-col items-center relative">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900 uppercase">Your Households</h1>
          <p className="text-gray-500 mt-2">Select a household to manage your pantry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Action Column */}
          <div className="flex flex-col gap-4">
            <button 
               onClick={handleCreateHouse}
               className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:border-blue-400 transition-all text-left group">
              <h2 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Create New Household</h2>
              <p className="text-sm text-gray-400">Start fresh and invite roommates</p>
            </button>

            {!showJoinInput ? (
              <button 
                onClick={() => setShowJoinInput(true)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 transition-all text-left group"
              >
                <h2 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Join Existing Household</h2>
                <p className="text-sm text-gray-400">Enter a 6-digit invite code</p>
              </button>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-400 flex flex-col gap-3 p-6 transition-all">
                <h2 className="font-bold text-blue-900">Enter Invite Code</h2>
                <input 
                  type="text"
                  placeholder="e.g. A1B2C3"
                  className="p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500 text-lg tracking-widest"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <button onClick={handleJoinHouse} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex-1 font-bold">Join</button>
                  <button onClick={() => setShowJoinInput(false)} className="bg-gray-100 px-4 py-2 rounded-xl text-gray-600">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* List Column */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
            <h2 className="font-bold text-xl mb-4 border-b pb-2 text-blue-900">Joined Households</h2>
            {loading ? (
              <p className="text-gray-400 text-sm italic">Loading your households...</p>
            ) : households.length > 0 ? (
              <div className="flex flex-col gap-3">
                {households.map((house) => (     
                  <div 
                      key={house._id} 
                      onClick={() => handleSelectHouse(house._id)} // <-- ADD THIS LINE
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-200"
                  >                  
                   <div>
                      <p className="font-semibold text-blue-900">{house.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">{house.role}</p>
                    </div>
                    <span className="text-blue-500 font-bold">→</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-400 text-sm">You haven't joined any households yet.</p>
                <p className="text-xs text-gray-300 mt-1">Create or join one to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* --- SUCCESS MODAL --- */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Household Created!</h2>
              <p className="text-gray-500 mb-6">Share this code with your roommates so they can join you.</p>
              <div className="bg-gray-100 p-4 rounded-2xl text-3xl font-mono font-bold tracking-widest text-blue-600 mb-6">
                {generatedCode}
              </div>
            <button 
              onClick={finishCreate} // <-- This will navigate to the dashboard
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;