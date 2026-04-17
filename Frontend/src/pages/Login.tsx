import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { buildPath } from "../utils/Path";
import { jwtDecode } from "jwt-decode";

// Create a type for decoded token
interface DecodedToken {
  userId: string;
  firstName: string;
  lastName: string;
  iat: number;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const obj = { email, password };

    try {
      const response = await fetch(buildPath("api/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      });

      const res = await response.json();

      // Error from backend
      if (res.error && res.error.length > 0) {
        setMessage(res.error);
        return;
      }

      // No token returned
      if (!res.accessToken) {
        setMessage("Login failed: no token returned");
        return;
      }

      // Store JWT
      localStorage.setItem("token_data", res.accessToken);

      // Decode JWT
      const decoded = jwtDecode<DecodedToken>(res.accessToken);

      const user = {
        id: decoded.userId,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      };

      // Store user info
      localStorage.setItem("user_data", JSON.stringify(user));

      // Redirect
      navigate("/home");

    } catch (err: any) {
      console.log(err);
      setMessage("Unable to connect to server");
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

          {message && (
            <p className="mt-3 text-sm text-red-500 text-center">{message}</p>
          )}

          
          <div className="mt-4 text-xs text-left">
            <p className="text-gray-600">
              Forgot your password? <br />
              <button
                onClick={() => navigate("/passwordChange")}
                className="underline font-semibold text-blue-600"
              >
                Reset Password
              </button>
            </p>
          </div>

          <div className="mt-4 text-xs text-left">
            <p className="text-gray-600">
              Don't have an account? <br />
              <button
                onClick={() => navigate("/signup")}
                className="underline font-semibold text-blue-600"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;