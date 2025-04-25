import React, { useState } from "react";
import axios from "axios";
import "./Detail.css";

const Detail = () => {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState(""); // New Address State
  const [logo, setLogo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!storeName || !email || !contactNo || !address || !logo) {
      setMessage("Please fill in all fields and upload an image.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to save store details?"
    );
    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append("storeName", storeName);
    formData.append("email", email);
    formData.append("contactNo", contactNo);
    formData.append("address", address); // Adding Address
    formData.append("logo", logo);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/Detail/addDetail",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage(response.data.message);
      setStoreName("");
      setEmail("");
      setContactNo("");
      setAddress(""); // Reset Address
      setLogo(null);
      setImagePreview(null);
    } catch (error) {
      setMessage("Error saving store details. Please try again.");
    }
  };

  return (
    <div className="detail-container">
      <h2 className="detail-tagline">Set Your Store Details</h2>

      <div className="detail-input-group">
        <label className="detail-label" htmlFor="storeName">
          Store Name:
        </label>
        <input
          type="text"
          id="storeName"
          className="detail-input"
          placeholder="Enter store name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>

      <div className="detail-input-group">
        <label className="detail-label" htmlFor="email">
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="detail-input"
          placeholder="Enter store email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="detail-input-group">
        <label className="detail-label" htmlFor="contactNo">
          Contact Number:
        </label>
        <input
          type="number"
          id="contactNo"
          className="detail-input"
          placeholder="Enter contact number"
          value={contactNo}
          onChange={(e) => setContactNo(e.target.value)}
        />
      </div>

      {/* New Address Input Field */}
      <div className="detail-input-group">
        <label className="detail-label" htmlFor="address">
          Address:
        </label>
        <input
          type="text"
          id="address"
          className="detail-input"
          placeholder="Enter store address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="detail-input-group">
        <label className="detail-label" htmlFor="storeImage">
          Upload Image:
        </label>
        <input
          type="file"
          id="storeImage"
          className="detail-file-input"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      {message && <p className="success-message">{message}</p>}

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" className="preview-img" />
        </div>
      )}

      <div className="detail-actions">
        <button className="detail-save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Detail;
