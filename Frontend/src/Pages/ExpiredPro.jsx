import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import "../Styles/ExpiredPro.css";

const ExpiredPro = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [updatedExpiryDate, setUpdatedExpiryDate] = useState("");

  useEffect(() => {
    const fetchExpiredProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT from storage

        const response = await axios.get(
          "http://localhost:5000/api/product/expired-products",
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔐 Pass token for authentication
            },
          }
        );

        setData(response.data.expiredProducts);
      } catch (error) {
        console.error("Error fetching expired products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredProducts();
  }, []);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setUpdatedExpiryDate(
      product.ExpiryDate ? product.ExpiryDate.split("T")[0] : ""
    ); // Pre-fill date
    setEditModalOpen(true);
  };

  const closeModal = () => {
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateExpiryDate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem("token"); // Get JWT token

      // Update the expiry date for selected product
      await axios.put(
        `http://localhost:5000/api/product/update-expiredproduct/${selectedProduct._id}`,
        { ExpiryDate: updatedExpiryDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Re-fetch expired products using authenticated request
      const response = await axios.get(
        "http://localhost:5000/api/product/expired-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data.expiredProducts); // Refresh list with updated data
      closeModal();
    } catch (error) {
      console.error("Error updating expiry date:", error);
    }
  };

  const columns = [
    {
      name: "Bar Code",
      selector: (row) =>
        row.Probarcode ? (
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(row.Probarcode.toString(), searchText),
            }}
          />
        ) : (
          "N/A"
        ),
      sortable: true,
    },
    {
      name: "Product Name",
      selector: (row) =>
        (
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(row.ProductName, searchText),
            }}
          />
        ) || "N/A",
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) =>
        (
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(row.Category, searchText),
            }}
          />
        ) || "N/A",
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row) => row.Quantity || "N/A",
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={
            row.ProImage
              ? `http://localhost:5000/uploads/${row.ProImage}`
              : "/default-image.png"
          }
          alt={row.ProductName}
          style={{
            width: "75px",
            height: "75px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            objectFit: "cover",
          }}
        />
      ),
      ignoreRowClick: true,
      sortable: false,
    },
    {
      name: "Expiry Date",
      selector: (row) =>
        row.ExpiryDate
          ? new Date(row.ExpiryDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button className="edit-btn" onClick={() => handleEditClick(row)}>
          <FaEdit />
        </button>
      ),
      ignoreRowClick: true,
    },
  ];

  const filteredData = data.filter(
    (item) =>
      item.ProductName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Probarcode.toString().includes(searchText)
  );

  const highlightText = (text, search) => {
    if (!text) return ""; // Ensure text is not null/undefined
    if (typeof text !== "string") text = text.toString(); // Convert to string if not

    if (!search) return text; // If no search text, return original text
    const regex = new RegExp(`(${search})`, "gi"); // Case-insensitive search
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };

  // Keyboard Shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      if (editModalOpen) {
        setEditModalOpen(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [editModalOpen]);

  return (
    <div className="expired-product-table-container full-width">
      <h2 className="table-title">Expired Product Table</h2>
      <div className="table-controls-right">
        <input
          type="text"
          placeholder="Search expired product..."
          className="search-box"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        progressPending={loading}
      />

      {/* Custom Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="modal-close custom-modal-close"
              onClick={closeModal}
            >
              &times;
            </span>
            <h3 className="modal-title">Update Expiry Date</h3>

            <form onSubmit={handleUpdateExpiryDate}>
              <div
                className={`input-group ${updatedExpiryDate ? "focused" : ""}`}
              >
                <input
                  type="date"
                  className="modal-input"
                  required
                  value={updatedExpiryDate}
                  onChange={(e) => setUpdatedExpiryDate(e.target.value)}
                  onFocus={(e) => e.target.parentNode.classList.add("focused")}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.parentNode.classList.remove("focused");
                    }
                  }}
                />
                <label className="floating-label">Expiry Date</label>
              </div>

              <button type="submit" className="modal-submit-btn">
                Update Expiry Date
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredPro;
