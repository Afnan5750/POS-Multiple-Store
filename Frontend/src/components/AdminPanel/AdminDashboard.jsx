import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserTimes,
  FaUserCheck,
  FaStore,
  FaClock,
} from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  // State for storing the fetched data
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [disabledUsers, setDisabledUsers] = useState(0);
  const [totalStores, setTotalStores] = useState(0); // Updated to 0, will fetch from API

  // Fetch total users, user status stats, and total stores from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total users
        const totalUsersResponse = await fetch(
          "http://localhost:5000/api/auth/gettotalusers"
        );
        const totalUsersData = await totalUsersResponse.json();
        setTotalUsers(totalUsersData.totalUsers);

        // Fetch user status stats
        const statusStatsResponse = await fetch(
          "http://localhost:5000/api/auth/getUserStatusStats"
        );
        const statusStatsData = await statusStatsResponse.json();
        setPendingRequests(statusStatsData.totalPendingRequests);
        setActiveUsers(statusStatsData.totalActiveUsers);
        setDisabledUsers(statusStatsData.totalDisabledUsers);

        // Fetch total stores
        const totalStoresResponse = await fetch(
          "http://localhost:5000/api/detail/getTotalStores"
        );
        const totalStoresData = await totalStoresResponse.json();
        setTotalStores(totalStoresData.totalStores);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []); // Run once when component mounts

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-content">
        <div className="dashboard-container">
          <section className="dashboard-cards admin-dashboard-cards">
            {/* Card for All Users */}
            <div className="dashboard-card">
              <div className="dashboard-icon-container">
                <FaUsers className="dashboard-icon all-users" />
              </div>
              <h3 className="dashboard-card-title">{totalUsers}</h3>
              <p className="dashboard-card-text">All Users</p>
            </div>

            {/* Card for Pending Requests */}
            <div className="dashboard-card">
              <div className="dashboard-icon-container">
                <FaClock className="dashboard-icon pending-requests" />
              </div>
              <h3 className="dashboard-card-title">{pendingRequests}</h3>
              <p className="dashboard-card-text">Pending Requests</p>
            </div>

            {/* Card for Active Users */}
            <div className="dashboard-card">
              <div className="dashboard-icon-container">
                <FaUserCheck className="dashboard-icon active-users" />
              </div>
              <h3 className="dashboard-card-title">{activeUsers}</h3>
              <p className="dashboard-card-text">Active Users</p>
            </div>

            {/* Card for Disabled Users */}
            <div className="dashboard-card">
              <div className="dashboard-icon-container">
                <FaUserTimes className="dashboard-icon disabled-users" />
              </div>
              <h3 className="dashboard-card-title">{disabledUsers}</h3>
              <p className="dashboard-card-text">Disabled Users</p>
            </div>

            {/* Card for Total Stores */}
            <div className="dashboard-card">
              <div className="dashboard-icon-container">
                <FaStore className="dashboard-icon total-stores" />
              </div>
              <h3 className="dashboard-card-title">{totalStores}</h3>
              <p className="dashboard-card-text">Total Stores</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
