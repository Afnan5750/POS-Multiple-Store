const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Login = require("../models/Login");
const authenticate = require("../middlewares/authMiddleware");

// POST: Add a new category
router.post("/addcategory", authenticate, async (req, res) => {
  try {
    const { categoryName } = req.body;

    const user = await Login.findById(req.user.id).select("storeId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if category name already exists for the same store
    const existingCategory = await Category.findOne({
      categoryName,
      storeId: user.storeId,
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const newCategory = new Category({
      categoryName,
      storeId: user.storeId, // Set storeId to link with user store
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET: Fetch all categories
router.get("/getcategories", async (req, res) => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// GET: Logged-in user's categories
router.get("/getcategory", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get categories only related to the logged-in user's storeId
    const categories = await Category.find({ storeId: user.storeId });

    // If no categories are found
    if (!categories.length) {
      return res
        .status(404)
        .json({ message: "No categories found for this store" });
    }

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// GET: Fetch a single category
router.get("/getcategory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category fetched successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// PUT: Update category
router.put("/updatecategory/:id", async (req, res) => {
  try {
    const { categoryName } = req.body;
    const { id } = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { categoryName },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// DELETE: Delete category
router.delete("/deletecategory/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// GET: Get total number of categories
router.get("/totalcategories", async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    res.status(200).json({
      message: "Total categories fetched successfully",
      total: totalCategories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// GET: Get Logined User total number of categories
router.get("/totalcategory", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("storeId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count categories related to the logged-in user's storeId
    const totalCategories = await Category.countDocuments({
      storeId: user.storeId,
    });

    res.status(200).json({
      message: "Total categories fetched successfully",
      total: totalCategories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
