import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const sendUsername = username.toLowerCase();
    const sendPassword = password.toLowerCase();

    if (login(sendUsername, sendPassword)) {
      navigate("/");
    } else {
      toast("Invalid Login details");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="flex flex-col gap-8 w-1/2 border p-5">
        <Toaster />
        <div>
          <Label>Username:</Label>
          <Input
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Label>Password:</Label>
          <Input
            name="password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button onClick={handleLogin}>Login</Button>
      </form>
    </div>
  );
}

export default Login;
