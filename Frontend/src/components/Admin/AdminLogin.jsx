import React, { useState } from "react";
import logo from "../../assets/images/black-pos-logo.png";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    const Username = "admin";
    const Password = "admin123";

    setSuccessMessage("");
    setErrorMessage("");

    if (username === Username && password === Password) {
      localStorage.setItem("admin-token", "static-token");

      window.location.href = "/admin-dashboard";

      setSuccessMessage("Login successful!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } else {
      setErrorMessage("Invalid credentials. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="login-image-wrapper">
        <img src={logo} alt="POS Logo" className="login-image" />
      </div>

      <h2 className="login-heading">Admin Login</h2>
      <p className="login-subtext">
        Welcome back, Admin! Please enter your credentials to access the admin
        panel.
      </p>

      <form onSubmit={handleLogin}>
        <div className="login-input-group">
          <label className="login-label" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="login-input"
            placeholder="Enter your admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="login-input-group">
          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Enter your admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-actions">
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default AdminLogin;
