const express = require("express");
const multer = require("multer");
const Detail = require("../models/Detail");
const Login = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Multer storage for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "StoreDetail/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST Add Store Details
router.post("/addDetail", upload.single("logo"), async (req, res) => {
  try {
    const { storeName, contactNo, email, address } = req.body;
    const logo = req.file ? `/StoreDetail/${req.file.filename}` : null;

    // Create a new store detail record
    const newDetail = new Detail({
      storeName,
      logo,
      contactNo,
      email,
      address,
    });

    await newDetail.save();

    return res.json({
      message: "Store details added successfully",
      detail: newDetail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing store details" });
  }
});

// PUT Update Store Details
router.put("/updateDetail", upload.single("logo"), async (req, res) => {
  try {
    const { storeName, contactNo, email, address, currentPassword, username } =
      req.body;
    const logo = req.file ? `/StoreDetail/${req.file.filename}` : null;

    // Fetch store details
    let existingDetail = await Detail.findOne();
    if (!existingDetail) {
      return res.status(404).json({ error: "Store details not found" });
    }

    // Fetch user/admin responsible for updates
    const user = await Login.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate current password
    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    // Proceed with store detail updates
    if (storeName) {
      existingDetail.storeName = storeName;
      // Also update storeName in Login model
      user.storeName = storeName;
    }
    if (contactNo) existingDetail.contactNo = contactNo;
    if (email) existingDetail.email = email;
    if (address) existingDetail.address = address;
    if (logo) existingDetail.logo = logo;

    // Save both models
    await existingDetail.save();
    await user.save();

    res.json({
      message: "Store details updated successfully",
      detail: existingDetail,
    });
  } catch (err) {
    console.error("Error updating store details:", err);
    res.status(500).json({ error: "Error updating store details" });
  }
});

// GET Store Details
router.get("/getDetail", async (req, res) => {
  try {
    const details = await Detail.find();
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: "Error fetching store details" });
  }
});

// GET total stores
router.get("/getTotalStores", async (req, res) => {
  try {
    const totalStores = await Detail.countDocuments(); // Count total documents in Detail collection
    res.json({ totalStores });
  } catch (err) {
    console.error("Error fetching total store count:", err);
    res.status(500).json({ error: "Error fetching store count" });
  }
});

// DELETE Store
router.delete("/deleteStore/:id", async (req, res) => {
  const { id } = req.params; // Get the store ID from the request parameters
  try {
    // Find the store by its ID and remove it
    const deletedStore = await Detail.findByIdAndDelete(id);

    if (!deletedStore) {
      return res.status(404).json({ error: "Store not found" }); // If no store is found with the provided ID
    }

    res.status(200).json({ message: "Store deleted successfully" }); // Respond with success
  } catch (err) {
    res.status(500).json({ error: "Error deleting store" }); // Handle errors
  }
});

module.exports = router;
