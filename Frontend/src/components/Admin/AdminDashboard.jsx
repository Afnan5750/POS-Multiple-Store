import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component"; // Import the DataTable component
import { useNavigate } from "react-router-dom"; // Import useNavigate for page redirection
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaSignOutAlt,
  FaStore,
} from "react-icons/fa"; // Import icons

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState(""); // State to handle search text
  const navigate = useNavigate(); // Initialize the navigate hook for redirection

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/getusers");
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []); // Only fetch on initial load

  const handleApprove = async (id) => {
    try {
      await axios.put(
        "http://localhost:5000/api/auth/updateStatus",
        { userId: id, status: "active" } // Change status to active
      );

      setUsers((prevUsers) =>
        prevUsers.map(
          (user) => (user._id === id ? { ...user, status: "active" } : user) // Update local state after approval
        )
      );
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleDisable = async (id) => {
    try {
      await axios.put(
        "http://localhost:5000/api/auth/updateStatus",
        { userId: id, status: "disabled" } // Change status to disabled
      );

      setUsers((prevUsers) =>
        prevUsers.map(
          (user) => (user._id === id ? { ...user, status: "disabled" } : user) // Update local state after disabling
        )
      );
    } catch (error) {
      console.error("Error disabling user:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (filter === "all" || user.status === filter) &&
      (user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.storeName?.toLowerCase().includes(searchText.toLowerCase()))
  );

  const highlightText = (text, search) => {
    if (!text) return ""; // Ensure text is not null/undefined
    if (typeof text !== "string") text = text.toString(); // Convert to string if not

    if (!search) return text; // If no search text, return original text
    const regex = new RegExp(`(${search})`, "gi"); // Case-insensitive search
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };

  // Define columns for the data table
  const columns = [
    {
      name: "Store Name",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.storeName, searchText), // Apply highlight only to username
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Username",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.username, searchText), // Apply highlight only to username
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          {row.status === "pending" && (
            <button
              className="admin-panel-btn pending"
              onClick={() => handleApprove(row._id)}
            >
              Approve
            </button>
          )}

          {row.status === "active" && (
            <button
              className="admin-panel-btn disable"
              onClick={() => handleDisable(row._id)}
            >
              Disable
            </button>
          )}

          {row.status === "disabled" && (
            <button
              className="admin-panel-btn approve"
              onClick={() => handleApprove(row._id)} // Reactivate user
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  // Handle admin logout
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("admin-token");
      navigate("/admin");
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="sidebar-heading">Admin Panel</h2>
        <div className="sidebar-line"></div>
        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <FaUsers className="sidebar-icon" /> All Users{" "}
            {/* Icon for All Users */}
          </li>
          <li
            className={`sidebar-item ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <FaClock className="sidebar-icon" /> Pending Requests{" "}
            {/* Icon for Pending Requests */}
          </li>
          <li
            className={`sidebar-item ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            <FaCheckCircle className="sidebar-icon" /> Active Users{" "}
            {/* Icon for Active Users */}
          </li>
          <li
            className={`sidebar-item ${filter === "disabled" ? "active" : ""}`}
            onClick={() => setFilter("disabled")}
          >
            <FaBan className="sidebar-icon" /> Disabled Users{" "}
            {/* Icon for Disabled Users */}
          </li>
          <li
            className="sidebar-item"
            onClick={() => navigate("/store-detail")}
          >
            <FaStore className="sidebar-icon" />
            Add Store
          </li>
        </ul>

        {/* Logout button placed at the bottom of the sidebar */}
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" /> Logout{" "}
          {/* Add the icon before the text */}
        </button>
      </aside>

      <div className="admin-content">
        <h2 className="admin-panel-heading">Manage Users</h2>

        <div className="table-controls-right">
          <input
            type="text"
            className="search-box"
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
