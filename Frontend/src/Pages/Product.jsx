import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "../Styles/Product.css";

const Product = () => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expirydate, setExpirydate] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editProductName, setEditProductName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editRetailPrice, setEditRetailPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editProductImage, setEditProductImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false); // Dropdown visibility state
  const [unitError, setUnitError] = useState(""); // Error state
  const unitOptions = ["Kg", "Litre", "Piece", "Box", "Packet"];
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);
  const barcodeRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/category/getcategory",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Add token for authentication
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories);
        } else {
          console.error("Error fetching categories:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCategories();
  }, []);

  // Filter units based on search query
  const filteredUnits = unitOptions.filter((u) =>
    u.toLowerCase().includes(unit.toLowerCase())
  );

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(category.toLowerCase())
  );

  const handleUnitKeyDown = (e) => {
    if (showUnitDropdown) {
      if (e.key === "ArrowDown") {
        setUnitIndex((prev) =>
          prev < filteredUnits.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setUnitIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && unitIndex >= 0) {
        setUnit(filteredUnits[unitIndex]);
        setUnitIndex(-1);
        setShowUnitDropdown(false);
        setUnitError("");
      }
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (showCategoryDropdown) {
      if (e.key === "ArrowDown") {
        setCategoryIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setCategoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && categoryIndex >= 0) {
        setCategory(filteredCategories[categoryIndex].categoryName);
        setCategoryIndex(-1);
        setShowCategoryDropdown(false);
        setCategoryError("");
      }
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // Make sure token is stored on login

        const response = await axios.get(
          "http://localhost:5000/api/product/getproduct",
          {
            headers: {
              Authorization: `Bearer ${token}`,
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

  // Handle Delete Action
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/product/deleteproduct/${id}`
        );
        setData(data.filter((product) => product._id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  useEffect(() => {
    if (isAddProductModalOpen) {
      barcodeRef.current?.focus();
    }
  }, [isAddProductModalOpen]);

  const onView = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Probarcode", barcode);
    formData.append("ProductName", productName);
    formData.append("Category", category);
    formData.append("Company", company);
    formData.append("RetailPrice", retailPrice);
    formData.append("CostPrice", costPrice);
    formData.append("Unit", unit);
    formData.append("Quantity", quantity);
    formData.append("ExpiryDate", expirydate);
    formData.append("ProImage", productImage);

    const token = localStorage.getItem("token"); // Make sure your login flow stores the token here

    try {
      const response = await fetch(
        "http://localhost:5000/api/product/addproduct",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Required for authenticate middleware
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Product added successfully!");

        const updatedResponse = await axios.get(
          "http://localhost:5000/api/product/getproduct",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(updatedResponse.data.products);
        closeAddProductModal();
      } else {
        alert("Error: " + (result.message || "Something went wrong"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  const openEditProductModal = (product) => {
    // Check if ExpiryDate exists and is valid
    let formattedDate = "";
    if (product.ExpiryDate) {
      const dateObj = new Date(product.ExpiryDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
      } else {
        console.warn("Invalid ExpiryDate detected:", product.ExpiryDate);
      }
    }

    setEditExpiryDate(formattedDate);
    setEditProductName(product.ProductName);
    setEditCategory(product.Category);
    setEditCompany(product.Company);
    setEditBarcode(product.Probarcode);
    setEditCostPrice(product.CostPrice);
    setEditRetailPrice(product.RetailPrice);
    setEditUnit(product.Unit);
    setEditQuantity(product.Quantity);
    setEditProductImage(null);
    setEditImagePreview(
      product.ProImage
        ? `http://localhost:5000/uploads/${product.ProImage}`
        : ""
    );
    setSelectedProductId(product._id);
    setIsEditProductModalOpen(true);
  };

  const closeEditProductModal = () => {
    setIsEditProductModalOpen(false);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("ProductName", editProductName);
    formData.append("Category", editCategory);
    formData.append("Company", editCompany);
    formData.append("Probarcode", editBarcode);
    formData.append("CostPrice", editCostPrice);
    formData.append("RetailPrice", editRetailPrice);
    formData.append("Unit", editUnit);
    formData.append("Quantity", editQuantity);
    formData.append("ExpiryDate", editExpiryDate);
    if (editProductImage) {
      formData.append("ProImage", editProductImage);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/product/updateproduct/${selectedProductId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Product updated successfully!");

        // 🔄 Fetch updated product list for the logged-in user
        const token = localStorage.getItem("token");

        const updatedResponse = await fetch(
          "http://localhost:5000/api/product/getproduct",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedData = await updatedResponse.json();

        if (updatedResponse.ok) {
          setData(updatedData.products); // ✅ Update your state with filtered products
        } else {
          alert("Failed to fetch updated products: " + updatedData.message);
        }

        setIsEditProductModalOpen(false); // ✅ Close modal after success
      } else {
        alert("Failed to update product: " + data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Something went wrong!");
    }
  };

  const columns = [
    {
      name: "Barcode",
      selector: (row) => row.Probarcode,
      sortable: true,
      cell: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.Probarcode.toString()),
          }}
        />
      ),
    },
    {
      name: "Product Name",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{ __html: highlightText(row.ProductName) }}
        />
      ),
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{ __html: highlightText(row.Category) }}
        />
      ),
      sortable: true,
    },
    // {
    //   name: "Cost Price",
    //   selector: (row) => `Rs. ${row.CostPrice}`,
    //   sortable: true,
    // },
    {
      name: "Retail Price",
      selector: (row) => `Rs. ${row.RetailPrice}`,
      sortable: true,
    },
    { name: "Unit", selector: (row) => row.Unit, sortable: true },
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
          src={`http://localhost:5000/uploads/${row.ProImage}`}
          alt={row.ProductName}
          style={{
            width: "75px",
            height: "75px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
      ),
      ignoreRowClick: true,
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button className="view-btn" onClick={() => onView(row)}>
            <FaEye />
          </button>
          <button
            className="edit-btn"
            onClick={() => openEditProductModal(row)}
          >
            <FaEdit />
          </button>

          <button className="delete-btn" onClick={() => onDelete(row._id)}>
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  // Function to highlight search text in matching words
  const highlightText = (text) => {
    if (!searchText) return text; // If no search, return normal text

    const regex = new RegExp(`(${searchText})`, "gi"); // Case-insensitive search
    return text.replace(regex, `<span class="highlight">$1</span>`);
  };

  // Filter data based on search input
  const filteredData = data.filter(
    (item) =>
      (selectedCategory === "" || item.Category === selectedCategory) && // Filter by selected category
      (item.ProductName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Probarcode?.toString()
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.Category?.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Keyboard Shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      if (showModal) {
        setShowModal(false);
      }
      if (isAddProductModalOpen) {
        setIsAddProductModalOpen(false);
      }
      if (isEditProductModalOpen) {
        setIsEditProductModalOpen(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal, isAddProductModalOpen, isEditProductModalOpen]);

  return (
    <div className="product-table-container full-width">
      <h2 className="table-title">Product Table</h2>

      <div className="table-controls">
        <div className="button-dropdown-container">
          {/* Add Product Button */}
          <button className="add-button" onClick={openAddProductModal}>
            Add Product
          </button>

          <select
            className="filter-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search product..."
          className="search-box"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
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

      {isAddProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-close" onClick={closeAddProductModal}>
              &times;
            </span>
            <h3 className="modal-title">Add New Product</h3>

            <form onSubmit={handleAddProduct}>
              {[
                {
                  label: "Barcode",
                  type: "number",
                  state: barcode,
                  setState: setBarcode,
                  ref: barcodeRef,
                },
                {
                  label: "Product Name",
                  type: "text",
                  state: productName,
                  setState: setProductName,
                },
                {
                  label: "Company",
                  type: "text",
                  state: company,
                  setState: setCompany,
                },
                {
                  label: "Retail Price",
                  type: "number",
                  state: retailPrice,
                  setState: setRetailPrice,
                },
                {
                  label: "Cost Price",
                  type: "number",
                  state: costPrice,
                  setState: setCostPrice,
                },
                {
                  label: "Quantity",
                  type: "number",
                  state: quantity,
                  setState: setQuantity,
                },
              ].map((field, index) => (
                <div key={index} className="input-group">
                  <input
                    type={field.type}
                    className="modal-input"
                    required
                    value={field.state}
                    ref={field.ref}
                    onFocus={(e) =>
                      e.target.parentNode.classList.add("focused")
                    }
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.parentNode.classList.remove("focused");
                      }
                    }}
                    onChange={(e) => field.setState(e.target.value)}
                  />
                  <label className="floating-label">{field.label}</label>
                </div>
              ))}

              {/* Unit Searchable Dropdown */}
              <div
                className={`input-group ${
                  unit || showUnitDropdown ? "focused" : ""
                }`}
              >
                <input
                  type="text"
                  className="modal-input"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    setUnitError(""); // Clear error when typing
                    setActiveIndex(-1); // Reset active index on input change
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      setActiveIndex((prev) =>
                        prev < filteredUnits.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredUnits.length - 1
                      );
                    } else if (e.key === "Enter" && activeIndex !== -1) {
                      setUnit(filteredUnits[activeIndex]);
                      setUnitError(""); // Clear error on valid selection
                      setShowUnitDropdown(false);
                    }
                  }}
                  onFocus={() => setShowUnitDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowUnitDropdown(false), 200); // Delay to allow click selection
                    // Validation: Check if entered unit exists in the static list
                    if (!unitOptions.includes(unit) && unit !== "") {
                      setUnitError(
                        "Please select a valid unit from the dropdown."
                      );
                    }
                  }}
                />
                <label className="floating-label">Unit</label>

                {/* Dropdown List */}
                {showUnitDropdown && filteredUnits.length > 0 && (
                  <ul className="dropdown-list">
                    {filteredUnits.map((u, index) => (
                      <li
                        key={index}
                        className={index === activeIndex ? "active" : ""}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          setUnit(u);
                          setUnitError(""); // Clear error on valid selection
                          setShowUnitDropdown(false);
                        }}
                      >
                        {u}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Error Message */}
                {unitError && <p className="error-message">{unitError}</p>}
              </div>

              <div
                className={`input-group ${
                  category || showDropdown ? "focused" : ""
                }`}
              >
                <input
                  type="text"
                  className="modal-input"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setError(""); // Clear error when typing
                    setActiveCategoryIndex(-1); // Reset active index on input change
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      setActiveCategoryIndex((prev) =>
                        prev < filteredCategories.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      setActiveCategoryIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredCategories.length - 1
                      );
                    } else if (
                      e.key === "Enter" &&
                      activeCategoryIndex !== -1
                    ) {
                      setCategory(
                        filteredCategories[activeCategoryIndex].categoryName
                      );
                      setError(""); // Clear error on valid selection
                      setShowDropdown(false);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 200); // Delay to allow click selection
                    // Validation: Check if entered category exists in dropdown
                    const isCategoryValid = filteredCategories.some(
                      (cat) =>
                        cat.categoryName.toLowerCase() ===
                        category.toLowerCase()
                    );

                    if (!isCategoryValid && category !== "") {
                      setError(
                        "Please select a valid category from the dropdown."
                      );
                    }
                  }}
                />
                <label className="floating-label">Category</label>

                {/* Dropdown List */}
                {showDropdown && filteredCategories.length > 0 && (
                  <ul className="dropdown-list">
                    {filteredCategories.map((cat, index) => (
                      <li
                        key={cat._id}
                        className={
                          index === activeCategoryIndex ? "active" : ""
                        }
                        onMouseEnter={() => setActiveCategoryIndex(index)}
                        onClick={() => {
                          setCategory(cat.categoryName);
                          setError(""); // Clear error on valid selection
                          setShowDropdown(false);
                        }}
                      >
                        {cat.categoryName}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}
              </div>

              {/* Expiry Date */}
              <div className="input-group focused">
                <input
                  type="date"
                  className="modal-input"
                  value={expirydate}
                  onChange={(e) => setExpirydate(e.target.value)}
                />
                <label className="floating-label">Expiry Date</label>
              </div>

              {/* Image Upload */}
              <div className="input-group focused">
                <input
                  type="file"
                  className="modal-input"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setProductImage(file);
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label className="floating-label">Upload Image</label>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-img"
                  />
                </div>
              )}

              <button type="submit" className="modal-submit-btn">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-close" onClick={closeEditProductModal}>
              &times;
            </span>
            <h3 className="modal-title">Edit Product</h3>

            <form onSubmit={handleEditProduct}>
              {[
                {
                  label: "Product Name",
                  type: "text",
                  state: editProductName,
                  setState: setEditProductName,
                },
                {
                  label: "Company",
                  type: "text",
                  state: editCompany,
                  setState: setEditCompany,
                },
                {
                  label: "Barcode",
                  type: "number",
                  state: editBarcode,
                  setState: setEditBarcode,
                },
                {
                  label: "Retail Price",
                  type: "number",
                  state: editRetailPrice,
                  setState: setEditRetailPrice,
                },
                {
                  label: "Cost Price",
                  type: "number",
                  state: editCostPrice,
                  setState: setEditCostPrice,
                },
                {
                  label: "Quantity",
                  type: "number",
                  state: editQuantity,
                  setState: setEditQuantity,
                },
                {
                  label: "Expiry Date",
                  type: "date",
                  state: editExpiryDate || "", // Ensure it doesn’t break
                  setState: setEditExpiryDate,
                },
              ].map((field, index) => (
                <div
                  key={index}
                  className={`input-group ${field.state ? "focused" : ""}`}
                >
                  <input
                    type={field.type}
                    className="modal-input"
                    value={field.state}
                    onChange={(e) => field.setState(e.target.value)}
                  />
                  <label className="floating-label">{field.label}</label>
                </div>
              ))}

              {/* Unit Searchable Dropdown */}
              <div
                className={`input-group ${
                  editUnit || showUnitDropdown ? "focused" : ""
                }`}
              >
                <input
                  type="text"
                  className="modal-input"
                  value={editUnit}
                  onChange={(e) => {
                    setEditUnit(e.target.value);
                    setUnitError("");
                    setActiveIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      setActiveIndex((prev) =>
                        prev < filteredUnits.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredUnits.length - 1
                      );
                    } else if (e.key === "Enter" && activeIndex !== -1) {
                      e.preventDefault(); // 🚀 Prevents form submission
                      setEditUnit(filteredUnits[activeIndex]);
                      setUnitError("");
                      setShowUnitDropdown(false);
                    }
                  }}
                  onFocus={() => setShowUnitDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowUnitDropdown(false), 200);
                    if (!unitOptions.includes(editUnit) && editUnit !== "") {
                      setUnitError(
                        "Please select a valid unit from the dropdown."
                      );
                    }
                  }}
                />

                <label className="floating-label">Unit</label>

                {showUnitDropdown && filteredUnits.length > 0 && (
                  <ul className="dropdown-list">
                    {filteredUnits.map((u, index) => (
                      <li
                        key={index}
                        className={index === activeIndex ? "active" : ""}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          setEditUnit(u);
                          setUnitError("");
                          setShowUnitDropdown(false);
                        }}
                      >
                        {u}
                      </li>
                    ))}
                  </ul>
                )}

                {unitError && <p className="error-message">{unitError}</p>}
              </div>

              {/* Category Input with Dropdown */}
              <div
                className={`input-group ${
                  editCategory || showDropdown ? "focused" : ""
                }`}
              >
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Type to search or add category"
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value);
                    setError("");
                    setActiveIndex(-1); // Reset index when typing
                  }}
                  onKeyDown={(e) => {
                    if (filteredCategories.length > 0) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex((prev) =>
                          prev < filteredCategories.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex((prev) =>
                          prev > 0 ? prev - 1 : filteredCategories.length - 1
                        );
                      } else if (e.key === "Enter" && activeIndex !== -1) {
                        e.preventDefault();
                        setEditCategory(
                          filteredCategories[activeIndex].categoryName
                        );
                        setError("");
                        setShowDropdown(false);
                      }
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 200); // Delay to allow click selection

                    // Validation: Ensure category is selected from dropdown or is a new valid entry
                    const isCategoryValid = filteredCategories.some(
                      (cat) =>
                        cat.categoryName.toLowerCase() ===
                        editCategory.toLowerCase()
                    );

                    if (!isCategoryValid && editCategory.trim() !== "") {
                      setError(
                        "Please select a valid category from the dropdown."
                      );
                    }
                  }}
                />
                <label className="floating-label">Category</label>

                {/* Dropdown List */}
                {showDropdown && filteredCategories.length > 0 && (
                  <ul className="dropdown-list">
                    {filteredCategories.map((cat, index) => (
                      <li
                        key={cat._id}
                        className={index === activeIndex ? "active" : ""} // Highlight active item
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          setEditCategory(cat.categoryName);
                          setError("");
                          setShowDropdown(false);
                        }}
                      >
                        {cat.categoryName}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}
              </div>

              {/* Image Upload */}
              <div className="input-group focused">
                <input
                  type="file"
                  className="modal-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setEditProductImage(file);
                    if (file) {
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label className="floating-label">Upload Image</label>
              </div>

              {/* Image Preview */}
              {editImagePreview && (
                <div className="image-preview">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="preview-img"
                  />
                </div>
              )}

              <button type="submit" className="modal-submit-btn">
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
