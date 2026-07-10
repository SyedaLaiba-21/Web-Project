// const mongoose = require("mongoose");

// const specialSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description: String,
//     discount: Number,
//     image: String,
//     active: {
//         type: Boolean,
//         default: true
//     }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model("Special", specialSchema);
const mongoose = require("mongoose");

const specialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: "⭐" },
  origPrice: { type: Number, default: 0 },
  salePrice: { type: Number, required: true },
  discount: { type: String, default: "Special" },
  valid: { type: String, default: "Limited time" },
  desc: { type: String, default: "" },
  img: { type: String, default: "" },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model("Special", specialSchema);