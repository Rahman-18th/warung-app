import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Login = () => {

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);

  // 🔥 Auto redirect kalau sudah login
  useEffect(()=>{

    const token = localStorage.getItem("token");

    if(token){
      window.location.href="/dashboard";
    }

  },[]);

  const handleLogin = async (e:any) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await api.post("/auth/login",{
        username,
        password
      });

      console.log("LOGIN SUCCESS:", res.data);

      localStorage.setItem("token", res.data.token);

      window.location.href="/dashboard";

    } catch(err:any){

      console.log("LOGIN ERROR:", err.response?.data);

      toast.error(err.response?.data?.message || "Login gagal");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="login-page">

      <form className="login-card" onSubmit={handleLogin}>

        <h1 className="login-title">Warung App</h1>
        <p className="login-subtitle">Welcome back 👋</p>

        {/* USERNAME */}

        <div className="input-group">

          <input
            required
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />

          <label>Username</label>

        </div>

        {/* PASSWORD */}

        <div className="input-group password-group">

          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <label>Password</label>

          <span
            className="eye-icon"
            onClick={()=>setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>

        </div>

        <button
          className="login-button"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </form>

    </div>
  );
};

export default Login;