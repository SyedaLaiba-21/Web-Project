const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  category: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: String,

  emoji: {
    type: String,
    default: "🍽️"
  },

  tags: [{
    type: String
  }],

  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("MenuItem", menuItemSchema);