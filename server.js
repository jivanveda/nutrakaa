const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jivanveda:Krist0099@aushadhlife.8dqjbse.mongodb.net/nutrakaa?retryWrites=true&w=majority&appName=Aushadhlife')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ─── SCHEMAS ───────────────────────────────────────────────────────────────

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  city: String,
  state: String,
  address: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  productId: String,
  productName: String,
  price: Number,
  totalAmount: Number,
  status: { type: String, enum: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  mrp: Number,
  images: [String],
  benefits: [String],
  ingredients: String,
  howToUse: String,
  stock: { type: Number, default: 100 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);
const Admin = mongoose.model('Admin', adminSchema);

// ─── PINCODE API ───────────────────────────────────────────────────────────
const https = require('https');

app.get('/api/pincode/:pin', async (req, res) => {
  const pin = req.params.pin;
  if (!/^\d{6}$/.test(pin)) return res.json({ success: false });
  
  https.get(`https://api.postalpincode.in/pincode/${pin}`, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed[0].Status === 'Success') {
          const postOffice = parsed[0].PostOffice[0];
          res.json({ success: true, city: postOffice.District, state: postOffice.State });
        } else {
          res.json({ success: false });
        }
      } catch {
        res.json({ success: false });
      }
    });
  }).on('error', () => res.json({ success: false }));
});

// ─── ORDER ROUTES ──────────────────────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ success: true, orderId: order._id, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── ORDERS CSV EXPORT ─────────────────────────────────────────────────────
app.get('/api/orders/export/csv', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const escape = v => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ['OrderID','Name','Phone','Pincode','City','State','Address','Product','Quantity','Price','TotalAmount','Status','Date'];
    const rows = orders.map(o => [
      o._id, o.name, o.phone, o.pincode, o.city, o.state, o.address,
      o.productName, o.quantity, o.price, o.totalAmount, o.status,
      new Date(o.createdAt).toLocaleString('en-IN')
    ].map(escape).join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nutrakaa-orders-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PRODUCT ROUTES ────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ active: true });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── ADMIN AUTH ────────────────────────────────────────────────────────────

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  // Simple hardcoded admin — change in production
  if (username === (process.env.ADMIN_USER || 'admin') && 
      password === (process.env.ADMIN_PASS || 'nutrakaa@123')) {
    res.json({ success: true, token: 'nutrakaa-admin-token-2024' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ─── SEED PRODUCT ──────────────────────────────────────────────────────────

app.post('/api/seed', async (req, res) => {
  try {
    const existing = await Product.findOne();
    if (existing) return res.json({ message: 'Already seeded' });
    
    await Product.create({
      name: 'Nutrakaa Ayurvedic Sugar Control Powder',
      description: 'A powerful blend of traditional Ayurvedic herbs that naturally helps manage blood sugar levels. Made with 100% natural ingredients, no side effects.',
      price: 599,
      mrp: 999,
      images: [
        'https://via.placeholder.com/500x500/1a472a/ffffff?text=Nutrakaa+Sugar+Control'
      ],
      benefits: [
        'Naturally controls blood sugar levels',
        'Improves insulin sensitivity',
        'Boosts metabolism & energy',
        '100% Ayurvedic — no side effects',
        'Clinically tested herbs'
      ],
      ingredients: 'Karela, Jamun, Methi, Giloy, Vijaysar, Gurmar',
      howToUse: 'Mix 1 teaspoon in warm water or milk. Take twice daily — morning empty stomach and evening before dinner.',
    });
    res.json({ success: true, message: 'Product seeded!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATS ─────────────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const newOrders = await Order.countDocuments({ status: 'new' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const revenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        newOrders,
        confirmedOrders,
        shippedOrders,
        revenue: revenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
