import React from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
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
            We've sent a verification link to{" "}
            <span className="font-semibold">{email}</span>.
            <br /><br />
            Please check your inbox and click the link to verify your account.
          </p>

        </div>
      </Card>
    </Layout>
  );
};

export default Verification;