import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/images/black-pos-logo.png";
// import "./Login.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [activeStoreIndex, setActiveStoreIndex] = useState(-1);
  const [storeOptions, setStoreOptions] = useState([]);
  const [storeError, setStoreError] = useState("");

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/detail/getDetail"
        );
        const storeNames = response.data.map((store) => store.storeName); // Adjust field if necessary
        setStoreOptions(storeNames);
      } catch (error) {
        console.error("Error fetching store details", error);
      }
    };

    fetchStoreDetails();
  }, []);

  const handleStoreNameChange = (e) => {
    const value = e.target.value;
    setStoreName(value);

    // Reset error message if user starts typing
    setStoreError("");

    // Check if the store name matches any option
    const isMatch = storeOptions.some(
      (store) => store.toLowerCase() === value.toLowerCase()
    );

    if (!isMatch && value !== "") {
      setStoreError("Store name does not match any available options.");
    }
  };

  const handleStoreBlur = () => {
    setTimeout(() => setShowStoreDropdown(false), 200); // Delay to allow dropdown selection
  };

  const handleStoreFocus = () => {
    setShowStoreDropdown(true);
  };

  // Handle keyboard navigation in the dropdown
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      // Navigate down in the list
      setActiveStoreIndex((prevIndex) =>
        Math.min(storeOptions.length - 1, prevIndex + 1)
      );
    } else if (e.key === "ArrowUp") {
      // Navigate up in the list
      setActiveStoreIndex((prevIndex) => Math.max(0, prevIndex - 1));
    } else if (e.key === "Enter") {
      // Select the store on Enter
      setStoreName(storeOptions[activeStoreIndex]);
      setShowStoreDropdown(false); // Close dropdown after selection
    } else if (e.key === "Escape") {
      // Close the dropdown on Escape
      setShowStoreDropdown(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setStoreError(""); // Clear previous store error

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check if storeName is in the storeOptions list
    const isValidStore = storeOptions.includes(storeName);
    if (!isValidStore) {
      setStoreError("Please select a valid store name from the dropdown.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          storeName,
          password,
        }
      );

      setMessage("Registration successful! Please wait for admin approval.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-wrapper">
        <img src={logo} alt="POS Logo" className="login-image" />
      </div>

      <h2 className="login-heading">Register</h2>
      <p className="login-subtext">
        Create a new account to access the system.
      </p>

      <form onSubmit={handleRegister}>
        <div className="login-input-group">
          <label className="login-label" htmlFor="store-name">
            Store Name
          </label>
          <div className="input-group">
            <input
              type="text"
              id="store-name"
              className="login-input"
              placeholder="Enter your store name"
              value={storeName}
              onChange={handleStoreNameChange}
              onFocus={handleStoreFocus}
              onBlur={handleStoreBlur}
              onKeyDown={handleKeyDown} // Add keyboard navigation
              required
            />

            {/* Dropdown List */}
            {showStoreDropdown && storeOptions.length > 0 && (
              <ul className="dropdown-list">
                {storeOptions.map((store, index) => (
                  <li
                    key={index}
                    className={index === activeStoreIndex ? "active" : ""}
                    onMouseEnter={() => setActiveStoreIndex(index)}
                    onClick={() => {
                      setStoreName(store);
                      setShowStoreDropdown(false); // Close dropdown after selection
                    }}
                  >
                    {store}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Error Message */}
          {storeError && <p className="error-message">{storeError}</p>}
        </div>
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
        <div className="login-input-group">
          <label className="login-label" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            className="login-input"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="login-actions">
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
