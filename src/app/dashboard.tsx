import React, { useState } from 'react';
import axios from 'axios';
import { API } from './utils/schema';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API}/user/check-user`, { email });
      if (response.data.success) {
        localStorage.set("token", response.data.token);  // Store token in state
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1>Check Whether You are a member of 100xdevs Cohort</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
