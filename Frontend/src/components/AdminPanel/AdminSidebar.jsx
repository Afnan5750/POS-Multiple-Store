import React from "react";
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaSignOutAlt,
  FaTachometerAlt,
  FaStore,
  FaStoreAlt,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Use location to get the current route

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("admin-token");
      navigate("/admin");
    }
  };

  // Helper function to check if the current path matches the sidebar item path
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <aside className="admin-sidebar">
      <h2 className="sidebar-heading">Admin Panel</h2>
      <div className="sidebar-line"></div>
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${isActive("/admin-dashboard")}`}
          onClick={() => navigate("/admin-dashboard")}
        >
          <FaTachometerAlt className="sidebar-icon" /> Dashboard
        </li>
        <li
          className={`sidebar-item ${isActive("/all-users")}`}
          onClick={() => navigate("/all-users")}
        >
          <FaUsers className="sidebar-icon" /> All Users
        </li>
        <li
          className={`sidebar-item ${isActive("/pending-users")}`}
          onClick={() => navigate("/pending-users")}
        >
          <FaClock className="sidebar-icon" /> Pending Requests
        </li>
        <li
          className={`sidebar-item ${isActive("/active-users")}`}
          onClick={() => navigate("/active-users")}
        >
          <FaCheckCircle className="sidebar-icon" /> Active Users
        </li>
        <li
          className={`sidebar-item ${isActive("/disabled-users")}`}
          onClick={() => navigate("/disabled-users")}
        >
          <FaBan className="sidebar-icon" /> Disabled Users
        </li>
        <li
          className={`sidebar-item ${isActive("/all-stores")}`}
          onClick={() => navigate("/all-stores")}
        >
          <FaStoreAlt className="sidebar-icon" /> All Stores
        </li>
        <li
          className={`sidebar-item ${isActive("/store-detail")}`}
          onClick={() => navigate("/store-detail")}
        >
          <FaStore className="sidebar-icon" /> Add Store
        </li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="sidebar-icon" /> Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
