import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { buildPath } from '../utils/Path'; 

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
      return;
    }
    console.log("Form Data:", formData);

    const obj = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await fetch(buildPath('api/register'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      });

      const res = await response.json();

      if (res.error && res.error.length > 0) {
        setMessage(res.error);
      } else {
        navigate("/verification", { state: { email: formData.email } });
      }

    } catch (err: any) {
      console.log(err);
      setMessage("Unable to connect to server");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">
            PARCEL PANTRY
          </h1>
          <p className="text-blue-400 text-[10px] tracking-widest uppercase">
            Household Logistics Engine
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <Input 
              label="First Name"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />

            <Input 
              label="Last Name"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />

            

            <Input 
              label="Email"
              type="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Input 
              label="Password"
              type="password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            
            <Button type="submit">Create Account</Button>

            {message && (
              <p className="text-sm text-red-500 text-center mt-1">{message}</p>
            )}

            <p className="text-[10px] mt-2 text-gray-500">
              Already have an account? <br />
              <a href="/login" className="underline font-bold text-black">
                Login
              </a>
            </p>

          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Signup;
