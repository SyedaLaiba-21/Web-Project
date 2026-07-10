const Special = require("../models/Special");

const getSpecials = async (req, res) => {
    try {
        const specials = await Special.find();
        res.json(specials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSpecial = async (req, res) => {
    try {
        const special = await Special.create(req.body);
        res.status(201).json(special);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getSpecials,
    createSpecial
};