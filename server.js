const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// ================= SCHEMAS =================
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  product: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

const settingSchema = new mongoose.Schema({
  metaPixel: String,
});

const Order = mongoose.model("Order", orderSchema);
const Setting = mongoose.model("Setting", settingSchema);

// ================= ROUTES =================

// 🔥 CREATE ORDER
app.post("/api/order", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📦 GET ALL ORDERS
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// 📥 DOWNLOAD CSV
app.get("/api/orders/csv", async (req, res) => {
  const orders = await Order.find();

  const escapeCSV = (s) => {
    if (typeof s === "string") {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = ["Name", "Phone", "Address", "Product", "Amount", "Date"];

  const rows = orders.map((o) => [
    escapeCSV(o.name),
    escapeCSV(o.phone),
    escapeCSV(o.address),
    escapeCSV(o.product),
    o.amount,
    new Date(o.createdAt).toLocaleString(),
  ]);

  const csv =
    header.join(",") +
    "\n" +
    rows.map((r) => r.join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
  res.send(csv);
});

// 📊 SAVE META PIXEL
app.post("/api/meta", async (req, res) => {
  const { metaPixel } = req.body;

  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting({ metaPixel });
  } else {
    setting.metaPixel = metaPixel;
  }

  await setting.save();
  res.json({ success: true });
});

// 📊 GET META PIXEL
app.get("/api/meta", async (req, res) => {
  const setting = await Setting.findOne();
  res.json(setting);
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
