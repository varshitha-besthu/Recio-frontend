// Signup.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://recio-backend.onrender.com/signup", {
        email,
        password,
      });

      setMessage(response.data.message || "Signup successful!");
      navigate("/signin");
    } catch (error: any) {
      if (error.response) {
        setMessage(error.response.data.message || "Error occurred");
      } else {
        setMessage("Server not reachable");
      }
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Signup</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
