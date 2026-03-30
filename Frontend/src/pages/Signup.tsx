import React, { useState, FormEvent } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // AJAX Requirement: Using fetch to send data to your Express Backend
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("Response:", data);
      // Logic for Email Verification (required by project rules) would trigger here
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">PARCEL PANTRY</h1>
          <p className="text-blue-400 text-[10px] tracking-widest uppercase">Household Logistics Engine</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input 
              label="First Name" 
              placeholder="Value"
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
            />
            <Input 
              label="Last Name" 
              placeholder="Value"
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
            />
            <Input 
              label="Username" 
              placeholder="Value"
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="user@ucf.edu"
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Value"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
            
            <Button type="submit">Create Account</Button>
            
            <p className="text-[10px] mt-2 text-gray-500">
              Already have an account? <br />
              <a href="/login" className="underline font-bold text-black">Login</a>
            </p>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Signup;