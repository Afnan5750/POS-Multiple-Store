const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Login = mongoose.model("Login", loginSchema);

module.exports = Login;
