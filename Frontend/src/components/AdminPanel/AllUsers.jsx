import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./User.css"; // Reuse same styling

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

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
  }, []);

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/deleteuser/${id}`); // Delete user by ID

        // Remove the deleted user from the state
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("There was an error deleting the user. Please try again."); // Error message if deletion fails
      }
    }
  };

  const highlightText = (text, search) => {
    if (!text) return "";
    if (typeof text !== "string") text = text.toString();
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.storeName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: "Store Name",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.storeName, searchText),
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
            __html: highlightText(row.username, searchText),
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

          <button
            className="admin-panel-btn delete"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-content">
      <h2 className="admin-panel-heading">All Users</h2>

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
  );
};

export default AllUsers;
