import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

const PasswordChange: React.FC = () => {  
    const navigate = useNavigate(); // ✅ must be inside component

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: connect to backend
        alert("Password changed (placeholder)");
        navigate("/"); // go back to login after change
    };

    return (
        <Layout>
            <div className="flex flex-col items-center">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-900">PARCEL PANTRY</h1>
                    <p className="text-blue-400 text-xs tracking-widest uppercase">
                        Household Logistics Engine
                    </p>
                </div> 

                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Change Password
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Current Password
                            </label>       
                            <input
                                type="password"
                                placeholder="Current Password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </div>

                        <div className="mb-4">  
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="New Password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default PasswordChange;