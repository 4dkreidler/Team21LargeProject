import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";

const PasswordChange: React.FC = () => {  
    const navigate = useNavigate(); 

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState(""); 
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setEmailError("");

        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            
            const fakeRegisteredEmails = ["test@gmail.com", "user@email.com"];

            if (!fakeRegisteredEmails.includes(email)) {
                setEmailError("Email address not registered.");
                return;
            }

            
            setShowModal(true);

        } catch (err) {
            console.log(err);
            setError("Something went wrong.");
        }
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
                        {/* EMAIL */}
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Email Address
                            </label>       
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </div>

                        
                        {emailError && (
                            <p className="text-red-500 text-sm mb-4">{emailError}</p>
                        )}

                        {/* NEW PASSWORD */}
                        <div className="mb-4">  
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </div>

                       
                        {error && (
                            <p className="text-red-500 text-sm mb-4">{error}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Change Password
                            </Button>
                        </div>

                       
                        <div className="mt-4 text-xs text-left">    
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

         
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Password Updated
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been successfully changed.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PasswordChange;