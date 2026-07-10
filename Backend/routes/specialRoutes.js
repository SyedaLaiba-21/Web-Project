// const express = require("express");
// const router = express.Router();

// const {
//     getSpecials,
//     createSpecial
// } = require("../controllers/specialController");

// router.get("/", getSpecials);
// router.post("/", createSpecial);

// module.exports = router;

const express = require("express");
const router = express.Router();
const Special = require("../models/Special");

// GET all specials
router.get("/", async (req, res) => {
  try {
    const specials = await Special.find();
    res.json(specials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch specials", error: error.message });
  }
});

// GET a single special by ID
router.get("/:id", async (req, res) => {
  try {
    const special = await Special.findById(req.params.id);
    if (!special) return res.status(404).json({ message: "Special not found" });
    res.json(special);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch special", error: error.message });
  }
});

// POST create a new special
router.post("/", async (req, res) => {
  try {
    const special = new Special(req.body);
    await special.save();
    res.status(201).json(special);
  } catch (error) {
    res.status(400).json({ message: "Failed to create special", error: error.message });
  }
});

// PUT update a special
router.put("/:id", async (req, res) => {
  try {
    const updated = await Special.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Special not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update special", error: error.message });
  }
});

// DELETE a special
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Special.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Special not found" });
    res.json({ message: "Special deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete special", error: error.message });
  }
});

module.exports = router;