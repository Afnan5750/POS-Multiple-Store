import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import "../Styles/LowStock.css";

const LowStock = () => {
  const [searchText, setSearchText] = useState("");
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updatedQuantity, setUpdatedQuantity] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Make sure token is stored after login

        const response = await axios.get(
          "http://localhost:5000/api/product/lowstock",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in request header
            },
          }
        );

        setLowStockProducts(response.data.lowStockProducts || []);
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      }
    };

    fetchLowStockProducts();
  }, []);

  // Search filter
  const filteredProducts = lowStockProducts.filter((item) => {
    const matchesSearch =
      item.ProductName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Probarcode.toString().includes(searchText);

    const matchesOutOfStock = showOutOfStock ? item.Quantity === 0 : true;

    return matchesSearch && matchesOutOfStock;
  });

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setUpdatedQuantity(product.Quantity || "");
    setEditModalOpen(true);
  };

  const closeModal = () => {
    setEditModalOpen(false);
    setUpdatedQuantity("");
  };

  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem("token");

      // Update quantity
      await axios.put(
        `http://localhost:5000/api/product/update-lowstock/${selectedProduct._id}`,
        { Quantity: updatedQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Re-fetch low stock products with token
      const response = await axios.get(
        "http://localhost:5000/api/product/lowstock",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLowStockProducts(response.data.lowStockProducts || []);
      closeModal();
    } catch (error) {
      console.error("Error updating quantity:", error);
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
      selector: (row) =>
        row.Quantity === 0 ? (
          <span className="out-of-stock">Out of Stock</span>
        ) : (
          row.Quantity
        ),
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
    // {
    //   name: "Expiry Date",
    //   selector: (row) =>
    //     row.ExpiryDate
    //       ? new Date(row.ExpiryDate).toLocaleDateString("en-GB", {
    //           day: "2-digit",
    //           month: "2-digit",
    //           year: "numeric",
    //         })
    //       : "N/A",
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (row) => (
        <button className="edit-btn" onClick={() => openEditModal(row)}>
          <FaEdit />
        </button>
      ),
      ignoreRowClick: true,
    },
  ];

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
      if (setEditModalOpen) {
        setEditModalOpen(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [setEditModalOpen]);

  return (
    <div className="low-stock-table-container full-width">
      <h2 className="table-title">Low Stock Products</h2>

      <div className="table-controls">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="outOfStock"
            checked={showOutOfStock}
            onChange={() => setShowOutOfStock(!showOutOfStock)}
          />
          <label htmlFor="outOfStock">Out of Stock</label>
        </div>
        <input
          type="text"
          placeholder="Search product..."
          className="search-box"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        pagination
        highlightOnHover
      />

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
            <h3 className="modal-title">Update Quantity</h3>
            <form onSubmit={handleUpdateQuantity}>
              <div
                className={`input-group ${updatedQuantity ? "focused" : ""}`}
              >
                <input
                  type="number"
                  className="modal-input"
                  required
                  min="1"
                  value={updatedQuantity}
                  onChange={(e) => setUpdatedQuantity(e.target.value)}
                  onFocus={(e) => e.target.parentNode.classList.add("focused")}
                  onBlur={(e) => {
                    if (!e.target.value)
                      e.target.parentNode.classList.remove("focused");
                  }}
                />
                <label className="floating-label">New Quantity</label>
              </div>
              <button type="submit" className="modal-submit-btn">
                Update Quantity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStock;
