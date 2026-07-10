const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: String,

    items: [{
        name: String,
        quantity: Number,
        price: Number
    }],

    total: Number,

    status: {
        type: String,
        enum: ["Pending", "Preparing", "Ready", "Served"],
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);