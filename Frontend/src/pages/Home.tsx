import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";

// Define what a Household looks like for TypeScript
interface Household {
  _id: string;
  name: string;
  role: string;
}

const Home: React.FC = () => {
  // Start with an empty list. This will eventually be filled by an AJAX fetch call.
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // This is where the AJAX-enabled API call will go to fetch the user's real data
  useEffect(() => {
    // simulate a small delay for the "loading" feel
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl w-full px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900">YOUR HOUSEHOLDS</h1>
          <p className="text-gray-500 mt-2">Select a household to manage your pantry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Action Column */}
          <div className="flex flex-col gap-4">
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:border-blue-400 transition-all text-left group">
              <h2 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Create New Household</h2>
              <p className="text-sm text-gray-400">Start fresh and invite roommates</p>
            </button>
            
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 transition-all text-left group">
              <h2 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Join Existing Household</h2>
              <p className="text-sm text-gray-400">Enter a 6-digit invite code</p>
            </button>
          </div>

          {/* List Column */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
            <h2 className="font-bold text-xl mb-4 border-b pb-2">Joined Households</h2>
            
            {loading ? (
              <p className="text-gray-400 text-sm italic">Loading your households...</p>
            ) : households.length > 0 ? (
              <div className="flex flex-col gap-3">
                {households.map((house) => (
                  <div key={house._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-200">
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
      </div>
    </Layout>
  );
};

export default Home;