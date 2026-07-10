const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const specialRoutes = require("./routes/specialRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/specials", specialRoutes);
app.use("/api/orders", orderRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("ZESTORA Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});