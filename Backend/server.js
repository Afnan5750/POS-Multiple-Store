const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/productRoute");
const invoiceRoutes = require("./routes/invoiceRoute");
const categoryRoutes = require("./routes/categoryRoute");
const authRoutes = require("./routes/loginRoute");
const detailRoutes = require("./routes/detailRoute");
// const adminRoute = require("./routes/adminRoute");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/StoreDetail", express.static("StoreDetail"));

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => console.error("MongoDB Connection Failed:", error));

app.use("/api/product", productRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/detail", detailRoutes);
// app.use("/api/admin", adminRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
