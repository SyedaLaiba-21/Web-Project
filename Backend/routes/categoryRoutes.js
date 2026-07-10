// const express = require("express");
// const router = express.Router();

// const {
//     getCategories,
//     createCategory
// } = require("../controllers/categoryController");

// router.get("/", getCategories);
// router.post("/", createCategory);

// module.exports = router;

const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.post("/", async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;