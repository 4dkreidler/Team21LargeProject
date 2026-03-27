
import React, { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { PageTitle } from "../components/PageTitle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({ email, password });

    // TODO: connect to backend API
  };

  return (
    <Layout>
      <Card>
        <PageTitle
          title="ParcelPantry"
          subtitle="Sign in to your household"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-full  max-w-sm">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit">Login</Button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          Don’t have an account? Sign up
        </p>
        <Button type="submit">sign up
          
        </Button>

      </Card>
    </Layout>
  );
};

export default Login;
