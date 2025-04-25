const mongoose = require("mongoose");

// Define the schema for invoice items
const invoiceItemSchema = new mongoose.Schema(
  {
    Probarcode: { type: Number, required: true },
    ProductName: { type: String, required: true },
    Category: { type: String, required: true },
    Company: { type: String, required: true },
    RetailPrice: { type: Number, required: true },
    CostPrice: { type: Number, required: true },
    ProImage: { type: String, required: true },
    Unit: { type: String, required: true },
    Quantity: { type: Number, required: true, default: 1 },
    ExpiryDate: { type: Date, required: true },
    Profit: { type: Number, required: true },
  },
  { _id: false }
);

// Create a model to track the last invoice number for each store
const storeInvoiceCounterSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail", // reference to store's details schema
      required: true,
    },
    lastInvoiceNo: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StoreInvoiceCounter = mongoose.model(
  "StoreInvoiceCounter",
  storeInvoiceCounterSchema
);

// Define the main invoice schema
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: Number, unique: true },
    customerName: { type: String, required: true },
    customerContactNo: { type: Number, required: true },
    billedBy: { type: String, required: true },
    items: [invoiceItemSchema],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    changeAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail", // reference to the store's details
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to handle invoice number and profit calculation
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Fetch the storeId for the current store
    const storeId = this.storeId;

    // Check if there's an existing StoreInvoiceCounter document for this store
    let storeInvoiceCounter = await StoreInvoiceCounter.findOne({ storeId });

    if (!storeInvoiceCounter) {
      // If no StoreInvoiceCounter exists, create a new one starting from invoice number 1
      storeInvoiceCounter = new StoreInvoiceCounter({
        storeId,
        lastInvoiceNo: 1, // Start from 1 if there are no invoices for this store
      });
      await storeInvoiceCounter.save();
      this.invoiceNo = 1; // Set the invoice number to 1 for the first invoice
    } else {
      // Fetch the highest invoice number for the current store
      const highestInvoice = await Invoice.findOne({ storeId })
        .sort({ invoiceNo: -1 })
        .limit(1);

      if (highestInvoice) {
        // Increment the last invoice number based on the highest existing invoice number
        this.invoiceNo = highestInvoice.invoiceNo + 1;
      } else {
        // If no invoices exist for the store, set invoiceNo to 1
        this.invoiceNo = 1;
      }

      // Update the StoreInvoiceCounter with the new lastInvoiceNo
      storeInvoiceCounter.lastInvoiceNo = this.invoiceNo;
      await storeInvoiceCounter.save();
    }
  }

  // Calculate Profit for Each Item
  this.items.forEach((item) => {
    item.Profit = (item.RetailPrice - item.CostPrice) * item.Quantity;
  });

  // Calculate Total Profit for the Invoice
  this.totalProfit = this.items.reduce((acc, item) => acc + item.Profit, 0);

  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
