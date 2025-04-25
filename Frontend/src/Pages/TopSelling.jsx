import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import "../Styles/TopSelling.css";

const TopSelling = () => {
  const [searchText, setSearchText] = useState("");
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("today");

  // Fetch products based on selected filter
  const fetchTopSellingProducts = async (filter = "today") => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage

      const response = await axios.get(
        `http://localhost:5000/api/product/top-selling?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the headers
          },
        }
      );
      setTopSellingProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
    }
  };

  // Fetch products from API with token in header
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage or sessionStorage

        const response = await axios.get(
          "http://localhost:5000/api/product/getproducts",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token to the headers
            },
          }
        );
        setData(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    fetchTopSellingProducts(selectedFilter);
  }, [selectedFilter]);

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const onView = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Search filter
  const filteredProducts = topSellingProducts.filter((item) => {
    return (
      item.ProductName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Probarcode.toString().includes(searchText)
    );
  });

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
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button className="view-btn" onClick={() => onView(row)}>
            <FaEye />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const highlightText = (text, search) => {
    if (!text) return "";
    if (typeof text !== "string") text = text.toString();

    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };

  return (
    <div className="low-stock-table-container full-width">
      <h2 className="table-title">Top Selling Products</h2>

      <div className="table-controls">
        <div className="radio-filters">
          <label className="radio-label">
            <input
              type="radio"
              name="filter"
              value="today"
              checked={selectedFilter === "today"}
              onChange={handleFilterChange}
              className="radio-input"
            />
            Today
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="filter"
              value="monthly"
              checked={selectedFilter === "monthly"}
              onChange={handleFilterChange}
              className="radio-input"
            />
            Monthly
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="filter"
              value="overall"
              checked={selectedFilter === "overall"}
              onChange={handleFilterChange}
              className="radio-input"
            />
            Overall
          </label>
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
      {showModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-close" onClick={closeModal}>
              &times;
            </span>
            <h3 className="modal-title">{selectedProduct.ProductName}</h3>
            <img
              src={`http://localhost:5000/uploads/${selectedProduct.ProImage}`}
              alt={selectedProduct.ProductName}
              className="modal-image"
            />
            <p className="modal-text">
              <strong className="modal-label">Barcode:</strong>{" "}
              {selectedProduct.Probarcode}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Category:</strong>{" "}
              {selectedProduct.Category}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Company:</strong>{" "}
              {selectedProduct.Company}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Cost Price:</strong> Rs.{" "}
              {selectedProduct.CostPrice}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Retail Price:</strong> Rs.{" "}
              {selectedProduct.RetailPrice}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Unit:</strong>{" "}
              {selectedProduct.Unit}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Quantity:</strong>{" "}
              {selectedProduct.Quantity}
            </p>
            <p className="modal-text">
              <strong className="modal-label">Expiry Date:</strong>{" "}
              {selectedProduct.ExpiryDate
                ? new Date(selectedProduct.ExpiryDate).toLocaleDateString(
                    "en-GB"
                  )
                : "Lifetime"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopSelling;
