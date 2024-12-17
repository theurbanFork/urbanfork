const mongoose = require("mongoose");
const Category = require("./categoryModel");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  noOrders: { type: Number, default: 0 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

module.exports = mongoose.model("Product", productSchema);
