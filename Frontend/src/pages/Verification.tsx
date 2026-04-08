import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import envelope from "../assets/envelope.png";

const Verification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "your email";

  const [params] = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // 🔥 VERIFY TOKEN ON LOAD
  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/auth/verify?token=${token}`
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");

          // redirect after short delay
          setTimeout(() => {
            navigate("/verification-success");
          }, 1500);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Layout>
      <Card>
        <div className="flex flex-col items-center text-center gap-4">

          <img src={envelope} alt="Verify Email" className="w-40 h-40" />

          <h1 className="text-2xl font-bold">
            Verify your email address
          </h1>

          {/*  LOADING */}
          {status === "loading" && (
            <p className="text-gray-600 text-sm max-w-sm">
              Verifying <span className="font-semibold">{email}</span>...
            </p>
          )}

          {/*  SUCCESS */}
          {status === "success" && (
            <p className="text-green-600 text-sm">
              Email verified! Redirecting...
            </p>
          )}

          {/*  ERROR */}
          {status === "error" && (
            <p className="text-red-600 text-sm">
              Invalid or expired verification link.
            </p>
          )}

        </div>
      </Card>
    </Layout>
  );
};

export default Verification;