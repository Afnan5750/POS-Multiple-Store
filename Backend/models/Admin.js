// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminname: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
