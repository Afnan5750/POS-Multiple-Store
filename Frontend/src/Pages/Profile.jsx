import { useState, useEffect } from "react";
import "../Styles/Profile.css";
import defaultLogo from "../assets/images/black-pos-logo.png";
import { FaCamera } from "react-icons/fa";
import axios from "axios";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [storeName, setStoreName] = useState("Profile");
  const [editedStoreName, setEditedStoreName] = useState(storeName);
  const [logo, setLogo] = useState(defaultLogo);
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [inputValue, setInputValue] = useState(""); // empty string as the initial value

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/auth/getuser",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          const { user, storeDetail } = response.data;

          if (user?.username) {
            setUserDetails((prevDetails) => ({
              ...prevDetails,
              username: user.username,
            }));
          }

          if (storeDetail?.storeName) {
            setStoreName(storeDetail.storeName);
            setEditedStoreName(storeDetail.storeName);
          }

          if (storeDetail?.logo) {
            setLogo(`http://localhost:5000${storeDetail.logo}`);
          } else {
            console.warn("Logo not found in storeDetail.");
            setLogo(defaultLogo);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLogo(defaultLogo);
      }
    };

    fetchUserDetails();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setLogo(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "storeName") {
      setEditedStoreName(value); // Update the input field value
    } else {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const handleSaveStoreName = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication error. Please log in again.");
      clearMessages();
      return;
    }

    // Ensure that currentPassword (oldPassword) is provided
    if (!userDetails.oldPassword) {
      setError("Current password is required to update the store details.");
      clearMessages();
      return;
    }

    try {
      const formData = new FormData();
      formData.append("storeName", editedStoreName);
      formData.append("currentPassword", userDetails.oldPassword); // Updated field name
      formData.append("username", userDetails.username); // Ensure username is sent

      // Append image if a new one is selected
      if (selectedImage) {
        formData.append("logo", selectedImage);
      }

      // Send request with FormData
      const storeResponse = await axios.put(
        "http://localhost:5000/api/detail/updateDetail",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (storeResponse.data.message === "Store details updated successfully") {
        setSuccess("Store details updated successfully.");
        setStoreName(editedStoreName); // Update the heading value

        // If an image was updated, refresh the preview
        if (selectedImage) {
          setLogo(URL.createObjectURL(selectedImage));
          setSelectedImage(null);
        }
      }

      // Clear only the oldPassword field after successful update
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        oldPassword: "",
      }));

      setEditing(false);
      clearMessages();
    } catch (error) {
      setError(error.response?.data?.error || "Error updating details."); // Fixed error message handling
      clearMessages();
    }
  };

  const handleSavePassword = async () => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication error. Please log in again.");
      clearMessages();
      return;
    }

    // Ensure the new password and confirm password match
    if (userDetails.newPassword !== userDetails.confirmPassword) {
      setError("New password and confirmation password must match.");
      clearMessages();
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/updateuser",
        {
          oldPassword: userDetails.oldPassword,
          password: userDetails.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "User updated successfully") {
        setSuccess("Password updated successfully.");
      }

      // Clear password fields after successful update
      setUserDetails({
        ...userDetails,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsPasswordEditing(false);
      clearMessages();
    } catch (error) {
      setError(error.response?.data?.message || "Error updating password.");
      clearMessages();
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setIsPasswordEditing(false);

    // Clear password fields when editing is canceled
    setUserDetails({
      ...userDetails,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "e") {
        event.preventDefault(); // Toggle edit mode
        setEditing((prevEditing) => !prevEditing);
      }

      if (event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault(); // Open Change Password
        setIsPasswordEditing(true);
      }

      if (event.ctrlKey && event.key.toLowerCase() === "c") {
        event.preventDefault(); // Cancel editing
        handleCancelEdit();
      }

      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault(); // Save changes based on mode
        if (editing) {
          handleSaveStoreName(); // Save store details
        } else if (isPasswordEditing) {
          handleSavePassword(); // Update password
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleCancelEdit,
    editing,
    isPasswordEditing,
    handleSaveStoreName,
    handleSavePassword,
  ]); // Correct dependencies

  // Function to clear messages after 5 seconds
  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  return (
    <div className="profile-container">
      <div className="profile-image-wrapper">
        <img
          src={logo}
          alt="Logo"
          className="profile-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultLogo;
          }}
        />
        {editing && (
          <>
            <label htmlFor="fileUpload" className="change-image-icon">
              <FaCamera size={20} />
            </label>
            <input
              type="file"
              id="fileUpload"
              accept="image/*"
              className="file-input"
              onChange={handleImageChange}
            />
          </>
        )}
      </div>

      <h2 className="profile-heading">{storeName}</h2>

      <div className="profile-info-container">
        <div className="profile-input-group">
          <label className="profile-label">Username</label>
          <input
            type="text"
            name="username"
            value={userDetails.username}
            className="profile-input"
            disabled
          />
        </div>

        {editing && (
          <>
            <div className="profile-input-group">
              <label className="profile-label">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={editedStoreName} // Use editedStoreName here instead of storeName
                className="profile-input"
                onChange={handleChange}
              />
            </div>

            <div className="profile-input-group">
              <label className="profile-label">Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={userDetails.oldPassword}
                className="profile-input"
                onChange={handleChange}
                placeholder="Enter your current password"
              />
            </div>
          </>
        )}

        {isPasswordEditing && (
          <>
            <div className="profile-input-group">
              <label className="profile-label">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={userDetails.oldPassword}
                className="profile-input"
                onChange={handleChange}
              />
            </div>

            <div className="profile-input-group">
              <label className="profile-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={userDetails.newPassword}
                className="profile-input"
                onChange={handleChange}
              />
            </div>

            <div className="profile-input-group">
              <label className="profile-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={userDetails.confirmPassword}
                className="profile-input"
                onChange={handleChange}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="profile-actions">
        {!isPasswordEditing && !editing && (
          <button className="profile-edit-btn" onClick={() => setEditing(true)}>
            Edit Profile <span className="shortcut">Ctrl + E</span>
          </button>
        )}

        {!editing && !isPasswordEditing && (
          <button
            className="profile-edit-btn"
            onClick={() => setIsPasswordEditing(true)}
          >
            Change Password <span className="shortcut">Shift + E</span>
          </button>
        )}

        {editing && !isPasswordEditing && (
          <>
            <button className="save-btn" onClick={handleSaveStoreName}>
              Update Store Name <span className="shortcut">Ctrl + S</span>
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit}>
              Cancel <span className="shortcut">Ctrl + C</span>
            </button>
          </>
        )}

        {isPasswordEditing && (
          <>
            <button className="save-btn" onClick={handleSavePassword}>
              Update Password <span className="shortcut">Ctrl + S</span>
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit}>
              Cancel <span className="shortcut">Ctrl + C</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
