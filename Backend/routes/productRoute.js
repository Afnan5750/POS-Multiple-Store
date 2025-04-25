const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const Login = require("../models/Login");
const authenticate = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Add Product Route
router.post(
  "/addproduct",
  authenticate,
  upload.single("ProImage"),
  async (req, res) => {
    try {
      const {
        Probarcode,
        ProductName,
        Category,
        Company,
        RetailPrice,
        CostPrice,
        Unit,
        Quantity,
        ExpiryDate,
      } = req.body;

      const ProImage = req.file ? req.file.filename : null;

      // Get storeId from authenticated user
      const user = await Login.findById(req.user.id).select("storeId");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if product with same barcode or name exists for this store
      const existingProduct = await Product.findOne({
        storeId: user.storeId,
        $or: [{ Probarcode }, { ProductName }],
      });

      if (existingProduct) {
        return res.status(400).json({
          message: "Product with the same barcode or name already exists",
        });
      }

      const newProduct = new Product({
        Probarcode,
        ProductName,
        Category,
        Company,
        RetailPrice,
        CostPrice,
        ProImage,
        Unit,
        Quantity,
        ExpiryDate,
        storeId: user.storeId, // ✅ link product to store
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product added successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Update Product Route
router.put(
  "/updateproduct/:id",
  upload.single("ProImage"),
  async (req, res) => {
    try {
      const {
        Probarcode,
        ProductName,
        Category,
        Company,
        RetailPrice,
        CostPrice,
        Unit,
        Quantity,
        ExpiryDate,
      } = req.body;
      const ProImage = req.file ? req.file.filename : undefined;

      const updatedData = {
        Probarcode,
        ProductName,
        Category,
        Company,
        RetailPrice,
        CostPrice,
        Unit,
        Quantity,
        ExpiryDate,
      };
      if (ProImage) updatedData.ProImage = ProImage;

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete Product Route
router.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product Route
router.get("/getproduct/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Product Route
router.get("/getproducts", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Login user's products
router.get("/getproduct", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get products only related to the logged-in user's storeId
    const products = await Product.find({ storeId: user.storeId });

    // If no products are found
    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found for this store" });
    }

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Top Selling Products Route
router.get("/top-selling", authenticate, async (req, res) => {
  const { filter = "today" } = req.query; // Default to 'today'
  const now = new Date();
  let startDate;

  if (filter === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
  } else {
    startDate = null; // For 'overall', no date filtering
  }

  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("storeId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = { storeId: user.storeId }; // Filter by the storeId of the logged-in user

    // If a start date is provided (for filtering by date), add it to the query
    if (startDate) {
      query.updatedAt = { $gte: startDate }; // Filter by 'updatedAt' (assuming it tracks sales)
    }

    const topProducts = await Product.find(query)
      .sort({ sold: -1 }) // Sort descending by the 'sold' field
      .limit(10); // Limit to top 10 products

    res.status(200).json({ products: topProducts });
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Login user's Expired Product Route
router.get("/expired-products", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("storeId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the current date (reset time to the start of the day)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of the day

    // Find expired products for the logged-in user's storeId
    const expiredProducts = await Product.find({
      storeId: user.storeId, // Filter by the storeId of the logged-in user
      ExpiryDate: { $lt: today }, // ExpiryDate is before today
    });

    // If no expired products are found, return an empty array
    res.status(200).json({
      expiredProducts: expiredProducts.length > 0 ? expiredProducts : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Expired Product Route
router.put("/update-expiredproduct/:id", async (req, res) => {
  try {
    const { ExpiryDate } = req.body; // Get new expiry date from request

    if (!ExpiryDate) {
      return res.status(400).json({ message: "Expiry date is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ExpiryDate },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Expiry date updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Low Stock Products
router.get("/lowstock", authenticate, async (req, res) => {
  try {
    const user = await Login.findById(req.user.id).select("storeId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lowStockProducts = await Product.find({
      storeId: user.storeId,
      Quantity: { $lt: 10 },
    });

    res.status(200).json({
      message: "Low stock products fetched successfully",
      lowStockProducts,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update Product Quantity
router.put("/update-lowstock/:id", async (req, res) => {
  try {
    const { Quantity } = req.body;
    const { id } = req.params;

    // Ensure the quantity is provided and is a valid number
    if (Quantity === undefined || isNaN(Quantity)) {
      return res.status(400).json({ error: "Invalid quantity provided" });
    }

    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { Quantity },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Total Number of Products and Total Revenue
router.get("/productstats", async (req, res) => {
  try {
    const today = new Date(); // Get today's date

    // Get total number of products
    const totalProducts = await Product.countDocuments();

    // Get total revenue considering quantity
    const totalRevenueResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$RetailPrice", "$Quantity"] } },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Get expired products (ExpiryDate is in the past)
    const expiredProducts = await Product.countDocuments({
      ExpiryDate: { $lt: today },
    });

    // Get out-of-stock products (Quantity is 0 or less)
    const outOfStockProducts = await Product.countDocuments({
      Quantity: { $lte: 0 },
    });

    res.status(200).json({
      totalProducts,
      totalRevenue,
      expiredProducts,
      outOfStockProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Logged-in User's Total Number of Products and Total Revenue
router.get("/productstat", authenticate, async (req, res) => {
  try {
    const today = new Date();

    // Get logged-in user info
    const user = await Login.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter by user's storeId
    const storeFilter = { storeId: user.storeId };

    // Get total number of products for user's store
    const totalProducts = await Product.countDocuments(storeFilter);

    // Get total revenue for user's store
    const totalRevenueResult = await Product.aggregate([
      { $match: storeFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$RetailPrice", "$Quantity"] } },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Get expired products for user's store
    const expiredProducts = await Product.countDocuments({
      ...storeFilter,
      ExpiryDate: { $lt: today },
    });

    // Get out-of-stock products for user's store
    const outOfStockProducts = await Product.countDocuments({
      ...storeFilter,
      Quantity: { $lte: 0 },
    });

    res.status(200).json({
      totalProducts,
      totalRevenue,
      expiredProducts,
      outOfStockProducts,
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
