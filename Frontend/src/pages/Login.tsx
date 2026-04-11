import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log("Attempting login for:", email);

    const obj = { email, password };

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      });

      const res = await response.json();

      if (res.id <= 0) {
        alert("Invalid login");
      } else {
        console.log("Logged in:", res);
        const userData = {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            houseID: res.houseID || ""
          };
          localStorage.setItem("user_data", JSON.stringify(userData));
        navigate("/home");
      }

    } catch (err) {
      console.log(err);
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
              <a href="/signup" className="underline font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;