const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    Probarcode: { type: Number, required: true },
    ProductName: { type: String, required: true },
    Category: { type: String, required: true },
    Company: { type: String, required: true },
    CostPrice: { type: Number, required: true }, // The price at which the product was purchased.
    RetailPrice: { type: Number, required: true }, // The price at which the product is sold to customers.
    ProImage: { type: String, required: true },
    Unit: { type: String, required: true },
    Quantity: { type: Number, required: true, default: 0 },
    ExpiryDate: { type: Date },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
