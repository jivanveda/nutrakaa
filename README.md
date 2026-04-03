# 🌿 Nutrakaa COD E-Commerce — Complete Setup Guide

## 📁 Project Structure
```
project/
├── server.js          ← Node.js + Express + MongoDB backend
├── package.json       ← Dependencies
├── .env.example       ← Environment variable template
├── index.html         ← Product landing page (frontend)
└── admin/
    └── index.html     ← Admin panel
```

---

## ✅ What's New in This Version

| Feature | Where |
|---|---|
| 📊 Meta Pixel | Admin ▶ Settings — enter Pixel ID, no code changes needed |
| ⬇️ Export Orders CSV | Admin ▶ Orders tab ▶ "Export CSV" button |
| 🔗 Dynamic API URL | Admin ▶ Settings — change backend URL without editing code |
| 🗄️ MongoDB Atlas connected | server.js wired to your Aushadhlife cluster |

---

## 🚀 STEP 1: Set Up MongoDB Atlas (already have cluster)

Your cluster: `aushadhlife.8dqjbse.mongodb.net`  
Username: `jivanveda`

1. Go to **Atlas → Network Access** → Add IP: `0.0.0.0/0` (Allow from Anywhere — required for Render)
2. Go to **Atlas → Database Access** → Confirm user `jivanveda` has **readWrite** on `nutrakaa` database
3. Your connection string:
```
mongodb+srv://jivanveda:<YOUR_PASSWORD>@aushadhlife.8dqjbse.mongodb.net/nutrakaa?retryWrites=true&w=majority&appName=Aushadhlife
```

---

## 🚀 STEP 2: Deploy Backend on Render

1. Push your project files to a **GitHub repo**
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Fill in:
   - **Name:** `nutrakaa-backend`
   - **Root Directory:** `.` (or wherever server.js is)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:

```
MONGODB_URI  = mongodb+srv://jivanveda:YOUR_PASSWORD@aushadhlife.8dqjbse.mongodb.net/nutrakaa?retryWrites=true&w=majority&appName=Aushadhlife
ADMIN_USER   = admin
ADMIN_PASS   = nutrakaa@123
PORT         = 5000
```

6. Click **Create Web Service**
7. Wait 2–3 min → you'll get a URL like: `https://nutrakaa-backend.onrender.com`

---

## 🚀 STEP 3: Seed Your First Product

After backend is live, visit in browser:
```
https://nutrakaa-backend.onrender.com/api/seed
```

---

## 🚀 STEP 4: Deploy Frontend & Admin on Render Static Sites

### Frontend (index.html)
1. Render → New → **Static Site**
2. Connect repo → Root: folder containing `index.html`
3. Build Command: *(leave empty)*
4. Publish Directory: `.`
5. Deploy → get URL like `https://nutrakaa.onrender.com`

### Admin Panel (admin/index.html)
Repeat the same steps for the `admin/` folder.

---

## 🚀 STEP 5: Connect Admin to Your Backend (one-time, no code edit needed)

1. Open your admin panel URL in browser
2. Log in (admin / nutrakaa@123)
3. Go to **⚙️ Settings tab**
4. Under **Backend API URL**, enter: `https://nutrakaa-backend.onrender.com`
5. Click **Save URL** → reload the page

The frontend storefront also reads this URL from the same browser storage — open `index.html` in the same browser after setting it in admin.

> **Note:** If frontend and admin are on different domains/browsers, you'll need to either set the URL in both, or hardcode it directly in the HTML files by replacing `YOUR-BACKEND.onrender.com`.

---

## 🚀 STEP 6: Set Up Meta Pixel

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel → copy the **Pixel ID** (15–16 digit number)
3. In Admin panel → **⚙️ Settings** → paste Pixel ID → **Save**

**Events tracked automatically:**
- `PageView` — on every storefront visit
- `InitiateCheckout` — when user clicks "Order Now"
- `Purchase` — when order is placed successfully (with ₹ value)

---

## 📥 Export Orders as CSV

1. Admin panel → **📦 Orders tab**
2. Click **⬇️ Export CSV** button
3. Downloads a `.csv` file with columns:
   `OrderID, Name, Phone, Pincode, City, State, Address, Product, Quantity, Price, TotalAmount, Status, Date`

---

## 🔐 Admin Panel

- **Login:** admin / nutrakaa@123
- **Change password:** Update `ADMIN_PASS` env var on Render → Redeploy

---

## 💡 Tips

- **Free Render tier** sleeps after 15 min inactivity. Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend URL every 10 min.
- **MongoDB Atlas Free (M0):** 512MB storage, plenty for thousands of orders.
- To keep passwords safe, **never commit your `.env` file** to GitHub — only commit `.env.example`.

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/export/csv` | Download orders as CSV |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |
| GET | `/api/products` | Get active products |
| GET | `/api/products/all` | Get all products (admin) |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Edit product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/pincode/:pin` | Auto fetch city/state |
| GET | `/api/stats` | Dashboard stats |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/seed` | Seed default product |
