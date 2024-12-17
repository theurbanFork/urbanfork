const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      contact_no: { type: String, required: true },
    },
    products: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Completed", "Picked", "Cancelled"],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
