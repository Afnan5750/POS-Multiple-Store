// AdminProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin-token");

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
