// routes/adminRoute.js
const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const router = express.Router();

// Admin registration route
router.post("/adminregister", async (req, res) => {
  const { adminname, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminname });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new admin
    const newAdmin = new Admin({
      adminname,
      password: await bcrypt.hash(password, 10), // Hash the password before saving
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Admin login route
router.post("/adminlogin", async (req, res) => {
  const { adminname, password } = req.body;

  try {
    // Find the admin by adminname
    const admin = await Admin.findOne({ adminname });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Successful login response (can include JWT or session handling here)
    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
