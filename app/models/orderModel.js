const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: {
    type: Object,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (phone) => {
        return (phone.trim().length === 10);
      },
      message: "Phone number must be 10 digits"
    }

  },
  paymentType: {
    type: String,
    required: true,
    default: "COD"
  },
  paymentStatus: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "order_placed"
  }
}, { timestamps: true })

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;