const mongoose = require("mongoose");

const DetailSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const Detail = mongoose.model("Detail", DetailSchema);
module.exports = Detail;
