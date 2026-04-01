import React from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import envelope from "../assets/envelope.png";

const Verification: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <Layout>
      <Card>
        <div className="flex flex-col items-center text-center gap-4">
          <img src={envelope} alt="Verify Email" className="w-40 h-40" />

          <h1 className="text-2xl font-bold">
            Verify your email address
          </h1>

          <p className="text-gray-600 text-sm max-w-sm">
            You've entered <span className="font-semibold">{email}</span> as the email address for your account.
            <br />
            Please verify this address by clicking the button below
          </p>

          <Button>Verify your email</Button>
        </div>
      </Card>
    </Layout>
  );
};

export default Verification;