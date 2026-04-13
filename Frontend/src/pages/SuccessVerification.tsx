import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

const SuccessVerification = () => {
  const navigate = useNavigate(); //  THIS WAS MISSING

  return (
    <Layout>
      <Card>
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-green-600">
            
          </h1>

          <p className="text-gray-600">
            Your account has been successfully verified.
          </p>

          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default SuccessVerification;