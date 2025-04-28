// routes/authRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Login = require("../models/Login");
const Detail = require("../models/Detail");
const authenticate = require("../middlewares/authMiddleware");

dotenv.config(); // Load environment variables

const router = express.Router();

// Get Logged-in User Details
router.get("/getuser", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and include storeId (exclude only password)
    const user = await Login.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the store detail linked to the user
    const storeDetail = await Detail.findOne({ _id: user.storeId });

    res.json({
      user,
      storeDetail,
    });
  } catch (error) {
    console.error("Error in getuser API:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Registration Route
router.post("/register", async (req, res) => {
  try {
    const { storeName, username, password, status } = req.body;

    console.log("Register attempt:", { storeName, username });

    if (!storeName || !username || !password) {
      return res.status(400).json({
        message: "Store name, username, and password are required",
      });
    }

    // Step 1: Find store by storeName
    const store = await Detail.findOne({ storeName });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const existingUser = await Login.findOne({ username, storeName });
    if (existingUser) {
      return res.status(400).json({
        message: "Username already in use for this store",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Login({
      storeName,
      username,
      password: hashedPassword,
      status: status || "pending",
      storeId: store._id, // Automatically fetched from Detail collection
    });

    await newUser.save();

    console.log("User created:", newUser);

    res.status(201).json({
      message: "User registered successfully",
      status: newUser.status,
      storeId: newUser.storeId,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Login Route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Login.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message:
          "Your account is pending approval. Please wait for admin approval.",
      });
    }

    if (user.status === "disabled") {
      return res.status(403).json({
        message:
          "Your account has been disabled. Contact support for assistance.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        storeName: user.storeName,
        storeId: user.storeId, // Include storeId here
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update User Route (Protected Route)
router.put("/updateuser", authenticate, async (req, res) => {
  try {
    const { username, oldPassword, password, status } = req.body;
    const userId = req.user.id;

    const user = await Login.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect." });
      }

      if (oldPassword === password) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (username) user.username = username;
    if (status) user.status = status;

    await user.save();
    res.json({ message: "User updated successfully", status: user.status });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all users (for Admin Panel)
router.get("/getusers", async (req, res) => {
  try {
    const users = await Login.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET total number of users
router.get("/gettotalusers", async (req, res) => {
  try {
    const totalUsers = await Login.countDocuments(); // Count all documents in the Login collection
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total user count:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update User Status (Admin Route)
router.put("/updateStatus", async (req, res) => {
  try {
    const { userId, status } = req.body;

    const validStatuses = ["pending", "active", "disabled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await Login.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;

    await user.save();
    res.json({
      message: "User status updated successfully",
      status: user.status,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/getUserStatusStats", async (req, res) => {
  try {
    // Count users based on their status
    const totalPendingRequests = await Login.countDocuments({
      status: "pending",
    });
    const totalActiveUsers = await Login.countDocuments({ status: "active" });
    const totalDisabledUsers = await Login.countDocuments({
      status: "disabled",
    });

    res.json({
      totalPendingRequests,
      totalActiveUsers,
      totalDisabledUsers,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete User (Admin Route)
router.delete("/deleteuser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user by ID
    const user = await Login.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
