
import React, { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Layout } from "../components/Layout";
import { PageTitle } from "../components/PageTitle";

const Login = () => {
  const [message,setMessage] = useState('');
  const [loginPassword, setPassword] = useState("");
  const [loginEmail,setLoginEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({ loginEmail, loginPassword });

    // TODO: connect to backend API
  };

  async function doLogin(event:React.FormEvent<HTMLFormElement>) : Promise<void>
  {
    event.preventDefault();
    
    var obj = {email:loginEmail,password:loginPassword};
    var js = JSON.stringify(obj);
    
    try
    {
      const response = await fetch('http://localhost:5000/api/login',
        {method:'POST',body:js,headers:{'Content-Type':'application/json'}});
    
        var res = JSON.parse(await response.text());
    
        if( res.id <= 0 )
        {
          setMessage('User/Password combination incorrect');
        }
        else
        {
          var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
          localStorage.setItem('user_data', JSON.stringify(user));
    
          setMessage('');
          window.location.href = '/cards'; // send to proper landing page
        }
    }
    catch(error:any)
    {
      alert(error.toString());
      return;
    }
  };

  return (
    <Layout>
      <Card>
        <PageTitle
          title="ParcelPantry"
          subtitle="Sign in to your household"
        />

        <form onSubmit={doLogin} className="flex flex-col gap-4 mt-6 w-full  max-w-sm">
          <Input
            label="Email"
            type="email"
            id="loginEmail"
            value={loginEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            id="loginPassword"
            value={loginPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
