import React, { useState, FormEvent } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";

const Login: React.FC = () => {
  // We tell TypeScript these states will always be strings
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 'FormEvent' tells TS this function is specifically for handling forms
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // The rules require AJAX-enabled calls (using fetch/async/await)
    console.log("Attempting login for:", email);
    
    // Example of the required AJAX call structure:
    // const response = await fetch('/api/login', { method: 'POST', ... });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">PARCEL PANTRY</h1>
          <p className="text-blue-400 text-xs tracking-widest uppercase">Household Logistics Engine</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              placeholder="Value"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              placeholder="Value"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">Login</Button>
          </form>

          <div className="mt-4 text-xs text-left">
            <p className="text-gray-600">
              Don't have an account? <br />
              <a href="/signup" className="underline font-semibold">Sign up</a>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;