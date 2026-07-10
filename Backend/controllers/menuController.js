const MenuItem = require("../models/MenuItem");

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add menu item
const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Edit menu items
const updateMenuItem = async (req, res) => {
  try {

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(item);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};

//Delete menu items
const deleteMenuItem = async (req, res) => {
  try {
    console.log("DELETE ID:", req.params.id);

    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    console.log("DELETED ITEM:", deletedItem);

    if (!deletedItem) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    res.json({
      message: "Item deleted",
      deletedItem
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};