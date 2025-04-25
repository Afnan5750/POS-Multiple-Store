const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Login = require("../models/Login");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// Post Loginned User a new invoice
router.post("/addinvoice", authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 1: Check stock availability and if product belongs to the user's store
    for (const item of items) {
      // Fetch the product by its Probarcode and ensure it belongs to the user's store
      const product = await Product.findOne({
        Probarcode: item.Probarcode,
        storeId: user.storeId, // Ensure the product belongs to the current store
      });

      if (!product) {
        return res.status(400).json({
          message: `Product with barcode ${item.Probarcode} not found or does not belong to your store`,
        });
      }

      // Check if the requested quantity is available
      if (product.Quantity < item.Quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.ProductName}. Available: ${product.Quantity}, Requested: ${item.Quantity}`,
        });
      }
    }

    // Step 2: Create the invoice after stock validation
    const invoiceData = {
      ...req.body,
      storeId: user.storeId, // Add the storeId of the logged-in user
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Step 3: Deduct stock quantity after invoice creation
    for (const item of items) {
      const product = await Product.findOne({
        Probarcode: item.Probarcode,
        storeId: user.storeId, // Ensure you update the stock for the correct store
      });

      product.Quantity -= item.Quantity;
      await product.save();
    }

    res.status(201).json({
      message: "Invoice added and stock updated successfully",
      invoice,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding invoice", error: error.message });
  }
});

// Update an invoice
router.put("/updateinvoice/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const updatedData = req.body;

    // 1️⃣ Find the existing invoice
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 2️⃣ Check stock availability BEFORE modifying anything
    for (const newItem of updatedData.items) {
      const product = await Product.findOne({
        ProductName: newItem.ProductName,
      });

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product ${newItem.ProductName} not found` });
      }

      // Get old quantity from existing invoice
      const oldItem = existingInvoice.items.find(
        (item) => item.ProductName === newItem.ProductName
      );
      const previousQuantity = oldItem ? oldItem.Quantity : 0;
      const availableStock = product.Quantity + previousQuantity; // Virtually restore stock

      if (availableStock < newItem.Quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.ProductName}. Available: ${availableStock}, Requested: ${newItem.Quantity}`,
        });
      }
    }

    // 3️⃣ Restore old stock quantities
    for (const oldItem of existingInvoice.items) {
      const product = await Product.findOne({
        ProductName: oldItem.ProductName,
      });
      if (product) {
        product.Quantity += oldItem.Quantity; // Restore old quantity
        await product.save();
      }
    }

    // 4️⃣ Apply new stock adjustments
    for (const newItem of updatedData.items) {
      const product = await Product.findOne({
        ProductName: newItem.ProductName,
      });
      product.Quantity -= newItem.Quantity; // Reduce stock based on new quantity
      await product.save();
    }

    // 5️⃣ Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({
      message: "Invoice updated and stock adjusted successfully",
      updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Loginned user invoices
router.get("/getinvoices", authenticate, async (req, res) => {
  try {
    // Fetch the logged-in user and their associated storeId
    const user = await Login.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get invoices only related to the logged-in user's storeId
    const invoices = await Invoice.find({ storeId: user.storeId });

    // If no invoices are found
    if (!invoices.length) {
      return res
        .status(404)
        .json({ message: "No invoices found for this store" });
    }

    res.status(200).json({
      message: "Invoices fetched successfully",
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get a specific invoice by ID
router.get("/getinvoice/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: error.message });
  }
});

// Delete an invoice
router.delete("/deleteinvoice/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    // 1️⃣ Find the invoice before deletion
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 2️⃣ Restore product quantities
    for (const item of invoice.items) {
      const product = await Product.findOne({ ProductName: item.ProductName });
      if (product) {
        product.Quantity += item.Quantity; // Add back the sold quantity
        await product.save();
      }
    }

    // 3️⃣ Delete the invoice
    await Invoice.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Invoice deleted and stock restored successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting invoice", error: error.message });
  }
});

// Get Loginned user invoice by date range
router.get("/getInvoicesByDateRange", authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Check if both dates are provided
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and end date are required." });
    }

    // Convert to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include full day

    // Get user and storeId from JWT
    const user = await Login.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch invoices belonging to the user's store within date range
    const invoices = await Invoice.find({
      storeId: user.storeId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!invoices.length) {
      return res.status(404).json({
        message: "No invoices found for this store in given date range",
      });
    }

    res.status(200).json({
      message: "Invoices fetched successfully",
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices by date range:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get Logged in user invoice count of current month
router.get("/getMonthlyInvoiceCount", authenticate, async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ); // End of the current day

    // Get the logged-in user
    const user = await Login.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count invoices for this user's storeId within the current month
    const invoiceCount = await Invoice.countDocuments({
      storeId: user.storeId,
      createdAt: { $gte: firstDayOfMonth, $lte: currentDayOfMonth },
    });

    res.status(200).json({ totalInvoices: invoiceCount });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching monthly invoice count",
      error: error.message,
    });
  }
});

// Get Logged-in User Total , Monthly and Today Sales
router.get("/salesstats", authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get logged-in user
    const user = await Login.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggregate sales data for this store only
    const salesData = await Invoice.aggregate([
      {
        $match: {
          storeId: user.storeId,
        },
      },
      {
        $group: {
          _id: null,
          totalSale: { $sum: "$totalAmount" },
          monthlySale: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfMonth] },
                "$totalAmount",
                0,
              ],
            },
          },
          todaySale: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfToday] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = salesData[0] || {
      totalSale: 0,
      monthlySale: 0,
      todaySale: 0,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error calculating sales",
      error: error.message,
    });
  }
});

// Get Logged-in User Total , Monthly and Today Invoices and Profit
router.get("/getInvoiceStats", authenticate, async (req, res) => {
  try {
    const user = await Login.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const storeId = user.storeId;

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalInvoices,
      invoicesThisMonth,
      invoicesToday,
      totalProfitResult,
      monthlyProfitResult,
      todayProfitResult,
    ] = await Promise.all([
      Invoice.countDocuments({ storeId }), // Total invoices for this store
      Invoice.countDocuments({
        storeId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Invoice.countDocuments({
        storeId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      Invoice.aggregate([
        { $match: { storeId } },
        { $group: { _id: null, totalProfit: { $sum: "$totalProfit" } } },
      ]),
      Invoice.aggregate([
        {
          $match: {
            storeId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, monthlyProfit: { $sum: "$totalProfit" } } },
      ]),
      Invoice.aggregate([
        {
          $match: { storeId, createdAt: { $gte: startOfDay, $lte: endOfDay } },
        },
        { $group: { _id: null, todayProfit: { $sum: "$totalProfit" } } },
      ]),
    ]);

    res.status(200).json({
      totalInvoices,
      invoicesThisMonth,
      invoicesToday,
      totalProfit: totalProfitResult.length
        ? totalProfitResult[0].totalProfit
        : 0,
      monthlyProfit: monthlyProfitResult.length
        ? monthlyProfitResult[0].monthlyProfit
        : 0,
      todayProfit: todayProfitResult.length
        ? todayProfitResult[0].todayProfit
        : 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoice statistics",
      error: error.message,
    });
  }
});

module.exports = router;
