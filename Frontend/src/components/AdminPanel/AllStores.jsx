import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./User.css"; // Reuse the same styling

const AllStores = () => {
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/detail/getDetail"
        );
        setStores(res.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  const handleDeleteStore = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this store?"
    );

    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5000/api/detail/deleteStore/${id}`
        );

        // Remove the deleted store from the state
        setStores((prevStores) =>
          prevStores.filter((store) => store._id !== id)
        );
      } catch (error) {
        console.error("Error deleting store:", error);
        alert("There was an error deleting the store. Please try again.");
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

  const filteredStores = stores.filter(
    (store) =>
      store.storeName?.toLowerCase().includes(searchText.toLowerCase()) ||
      store.contactNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      store.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchText.toLowerCase())
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
      name: "Contact No",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.contactNo, searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.email, searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.address, searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button
            className="admin-panel-btn delete"
            onClick={() => handleDeleteStore(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-content">
      <h2 className="admin-panel-heading">All Stores</h2>

      <div className="table-controls-right">
        <input
          type="text"
          className="search-box"
          placeholder="Search stores..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredStores}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
};

export default AllStores;
