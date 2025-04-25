import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import "../Styles/Category.css";

const Category = () => {
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/category/getcategory", // Updated API endpoint
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
            },
          }
        );
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (addModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addModalOpen]);

  const handleAddCategory = async () => {
    if (!newCategoryName) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/category/addcategory", // Updated API endpoint
        { categoryName: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token in the headers
          },
        }
      );

      alert(response.data.message);
      setCategories([...categories, response.data.category]);
      setAddModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.response?.data?.message || "Failed to add category.");
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setUpdatedCategoryName(category.categoryName);
    setEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/category/updatecategory/${selectedCategory._id}`,
        { categoryName: updatedCategoryName }
      );

      alert(response.data.message);

      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === selectedCategory._id
            ? { ...category, categoryName: updatedCategoryName }
            : category
        )
      );
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/category/deletecategory/${id}`
      );
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== id)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const columns = [
    {
      name: "Category ID",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.categoryId.toString(), searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Category Name",
      selector: (row) => (
        <span
          dangerouslySetInnerHTML={{
            __html: highlightText(row.categoryName, searchText),
          }}
        />
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button className="edit-btn" onClick={() => handleEditClick(row)}>
            <FaEdit />
          </button>
          <button className="delete-btn" onClick={() => handleDelete(row._id)}>
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const filteredData = categories.filter(
    (item) =>
      item.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categoryId
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const highlightText = (text, search) => {
    if (!search) return text; // If no search text, return original text
    const regex = new RegExp(`(${search})`, "gi"); // Case-insensitive search
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };

  // Keyboard Shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      if (addModalOpen) {
        setAddModalOpen(false);
      }
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
  }, [editModalOpen, addModalOpen]);

  return (
    <div className="category-table-container full-width">
      <h2 className="table-title">Category Table</h2>
      <div className="table-controls">
        <button className="add-button" onClick={() => setAddModalOpen(true)}>
          Add Category
        </button>
        <input
          type="text"
          placeholder="Search category..."
          className="search-box"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          progressPending={loading}
        />
      )}

      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-modal-content">
            <span
              className="modal-close custom-modal-close"
              onClick={() => setAddModalOpen(false)}
            >
              &times;
            </span>
            <h3 className="modal-title">Add Category</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCategory();
              }}
            >
              <div
                className={`input-group ${
                  newCategoryName || isFocused ? "focused" : ""
                }`}
              >
                <input
                  type="text"
                  className="modal-input"
                  required
                  ref={inputRef}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                <label className="floating-label">Category Name</label>
              </div>

              <button type="submit" className="modal-submit-btn">
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content custom-modal-content">
            <span
              className="modal-close custom-modal-close"
              onClick={() => setEditModalOpen(false)}
            >
              &times;
            </span>
            <h3 className="modal-title">Edit Category</h3>

            <form onSubmit={handleUpdateCategory}>
              {[
                {
                  label: "Category Name",
                  type: "text",
                  state: updatedCategoryName,
                  setState: setUpdatedCategoryName,
                },
              ].map((field, index) => (
                <div
                  key={index}
                  className={`input-group ${field.state ? "focused" : ""}`}
                >
                  <input
                    type={field.type}
                    className="modal-input"
                    required
                    value={field.state}
                    onChange={(e) => field.setState(e.target.value)}
                  />
                  <label className="floating-label">{field.label}</label>
                </div>
              ))}

              <button type="submit" className="modal-submit-btn">
                Update Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
