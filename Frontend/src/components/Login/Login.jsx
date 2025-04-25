import React, { useState } from "react";
import axios from "axios";
import logo from "../../assets/images/black-pos-logo.png";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(""); // Clear previous success message
    setErrorMessage(""); // Clear previous error message

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      setSuccessMessage("Login successful!"); // Success message
      setTimeout(() => {
        setSuccessMessage(""); // Clear message after 5 seconds
      }, 5000);
      window.location.href = "/dashboard"; // Redirect to dashboard
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Try again."
      ); // Display error message
      setTimeout(() => {
        setErrorMessage(""); // Clear message after 5 seconds
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-wrapper">
        <img src={logo} alt="POS Logo" className="login-image" />
      </div>

      <h2 className="login-heading">Login</h2>
      <p className="login-subtext">
        Welcome back! Please enter your credentials to access your account.
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
            placeholder="Enter your username"
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
            placeholder="Enter your password"
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

      <div className="register-link">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="register-link-text">
            Register here
          </Link>
        </p>
      </div>

      {/* Display Success Message */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {/* Display Error Message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
