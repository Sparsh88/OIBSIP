# PizzaNest — Artisanal Pizza Delivery Full-Stack Application

[![OASIS INFOBYTE](https://img.shields.io/badge/OASIS%20INFOBYTE-Internship%20Level%203-FF5E3A?style=for-the-badge)](https://oasisinfobyte.com/)
[![React](https://img.shields.io/badge/React%2018-Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

---

## Overview
**PizzaNest** is a production-grade, full-stack pizza ordering, live tracking, and inventory management platform engineered for the **OASIS INFOBYTE Web Development & Designing Internship (Level 3)**.

The platform provides a dual-role architecture:
1. **Customer Portal**: Interactive 4-step visual pizza customizer, cart management, Razorpay test payment integration, and real-time WebSocket order tracking.
2. **Administrator Portal**: Real-time KPI dashboard, kitchen pipeline dispatch (`Order Received` ➔ `In Kitchen` ➔ `Sent to Delivery` ➔ `Delivered`), ingredient inventory tracking with automated stock deduction upon order confirmation, and automated `node-cron` low-stock email alerts via Nodemailer.

---

## Features

### User Features
- **Authentication & Security**: Secure user registration, password strength validation, duplicate email prevention, bcrypt password hashing, and JWT authorization.
- **Forgot Password Recovery**: Secure random token generation with 1-hour expiration and Nodemailer HTML email dispatch.
- **Pizza Menu Catalog**: Searchable and category-filtered menu (All, Veg, Non-Veg, Chef Specialty) with prep times and ingredients.
- **4-Step Pizza Customizer Studio**:
  - **Step 1 — Crust**: 5 options (*Thin Crust, Classic Hand Tossed, Cheese Burst, Whole Wheat, Gluten Free*).
  - **Step 2 — Sauce**: 5 options (*Classic Tomato Basil, Spicy Arrabbiata, Roasted Garlic Alfredo, Smoky BBQ, Basil Pesto*).
  - **Step 3 — Cheese**: Multiple artisan cheeses (*Mozzarella, Aged Cheddar, Parmesan Reggiano, Smoked Gouda, Vegan Mozzarella*).
  - **Step 4 — Vegetables & Toppings**: Multi-select toppings (*Red Onion, Capsicum, Mushroom, Golden Corn, Pickled Jalapeño, Black Olives, Cherry Tomato, Spinach*).
  - **Live Visual Stage**: Dynamic layering and color preview of chosen crust, sauce, cheese, and toppings.
  - **Live Dynamic Pricing**: Real-time calculation of ingredient add-ons and base dough costs.
- **Shopping Cart**: Itemized customization breakdown, quantity controls, server-trusted price recalculation, and tax/delivery fee rules.
- **Razorpay Test Payment**: Secure test-mode checkout popup with backend HMAC-SHA256 signature verification.
- **Real-Time Order Tracking**: Animated 4-step progress tracker with glowing pulses and live Socket.IO synchronizations.
- **Order History & Profile**: Itemized order receipts and address management.

### Admin Features
- **Dedicated Admin Authentication**: Separate login portal restricted by Role-Based Access Control (RBAC).
- **Executive KPI Dashboard**: Live metrics for Total Revenue, Total Orders, In-Kitchen, Out for Delivery, Low Stock alerts count, and recent incoming orders.
- **Live Order Management**: Search orders, filter by status, and execute 1-click status transitions that instantly broadcast to the customer's tracking screen without page reloads.
- **Inventory Management & Auto-Deduction**:
  - Automatically decrements base crusts, sauce ladles, cheese portions, and vegetable toppings immediately upon verified payment.
  - Manual stock replenishment (+10, +50 quick restock buttons).
  - Configurable safety thresholds and price add-ons.
  - Add, edit, and delete ingredients.
- **Scheduled Low-Stock Notifications**: Automated `node-cron` job executing periodically to detect low-stock items and send formatted alert emails to the admin with cooldown throttling.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Lucide Icons, Canvas-Confetti, Axios, Socket.IO Client |
| **Backend** | Node.js (ES Modules), Express.js, Socket.IO, Nodemailer, node-cron, Morgan, Helmet, CORS, express-rate-limit |
| **Database** | MongoDB with Mongoose ODM (Indexes, TTL Indexes, Virtuals, Pre-save hooks) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs (Salt factor 10), Role-Based Access Control (RBAC) |
| **Payment Gateway** | Razorpay Test Mode SDK (Paise conversion, HMAC-SHA256 signature verification) |
| **Styling** | Vanilla CSS Luxury Design System (Glassmorphism, CSS Variables, Responsive Grid) |

---

## Project Architecture

```
WebDev-L3-PizzaDelivery/
├── client/                      # React 18 + Vite Frontend
│   ├── public/                  # Favicon & assets
│   ├── src/
│   │   ├── assets/              # Curated pizza images
│   │   ├── components/          # Reusable UI (Navbar, Footer, Modal, Toast, Card, OrderStatusTracker, Loader)
│   │   ├── context/             # AuthContext, CartContext, SocketContext, ToastContext
│   │   ├── pages/               # Landing, Menu Dashboard, Customizer, Cart, Checkout, Tracking, Orders, Profile
│   │   │   └── admin/           # AdminLogin, AdminDashboard, AdminOrders, AdminInventory
│   │   ├── routes/              # ProtectedRoute, AdminRoute
│   │   ├── services/            # Axios API Client
│   │   ├── App.jsx              # Main routes configuration
│   │   ├── index.css            # Custom luxury design system
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── server/                      # Node.js + Express + ES Modules Backend
│   ├── src/
│   │   ├── config/              # MongoDB, Razorpay, Nodemailer, Socket.IO
│   │   ├── controllers/         # Auth, Admin, Pizza, Order, Payment, Inventory
│   │   ├── jobs/                # node-cron low-stock email scheduler
│   │   ├── middleware/          # JWT auth, RBAC adminOnly, centralized error handler, rate limiters
│   │   ├── models/              # User, Pizza, Inventory, Order, PasswordResetToken
│   │   ├── routes/              # RESTful API Endpoints
│   │   ├── services/            # Inventory deduction, Payment HMAC, Email templates
│   │   ├── sockets/             # Real-time order rooms & admin broadcasts
│   │   ├── utils/               # Database seed script
│   │   ├── app.js               # Express application
│   │   └── server.js            # Server entry point
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Database Models

### 1. `User` Model
- `name`: String (required, trimmed)
- `email`: String (required, unique, lowercased)
- `password`: String (bcrypt hashed, `select: false`)
- `role`: String enum (`'user'` | `'admin'`), default: `'user'`
- `phone`: String
- `address`: `{ street, city, state, zipCode }`
- `timestamps`: `createdAt`, `updatedAt`

### 2. `Pizza` Model
- `name`: String (required)
- `slug`: String (unique)
- `description`: String
- `category`: String enum (`'Veg'` | `'Non-Veg'` | `'Specialty'`)
- `basePrice`: Number (required)
- `image`: String (URL)
- `defaultBase`: String
- `defaultSauce`: String
- `defaultCheese`: String
- `defaultVeggies`: `[String]`
- `rating`: Number (1-5)
- `preparationTime`: String

### 3. `Inventory` Model
- `name`: String (required, unique)
- `category`: String enum (`'base'` | `'sauce'` | `'cheese'` | `'veggie'`)
- `quantity`: Number (min: 0)
- `unit`: String (`'portions'`, `'crusts'`, `'ladles'`)
- `lowStockThreshold`: Number (default: 20)
- `priceModifier`: Number (extra cost for premium ingredients)
- `isLowStock`: Virtual boolean (`quantity <= lowStockThreshold`)
- `lastAlertSentAt`: Date

### 4. `Order` Model
- `orderNumber`: String (unique, e.g. `PZ-68421`)
- `user`: ObjectId ref `User`
- `items`: Array of `{ name, customBase, customSauce, customCheese, customVeggies, quantity, unitPrice, totalPrice }`
- `subtotal`, `tax` (5%), `deliveryFee`, `totalAmount`: Number
- `paymentInfo`: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, status: 'pending'|'paid'|'failed', paidAt }`
- `orderStatus`: String enum (`'Order Received'`, `'In Kitchen'`, `'Sent to Delivery'`, `'Delivered'`, `'Cancelled'`)
- `statusHistory`: Array of `{ status, timestamp, note }`
- `deliveryAddress`: `{ street, city, state, zipCode, phone }`
- `customerNotes`: String

### 5. `PasswordResetToken` Model
- `user`: ObjectId ref `User`
- `tokenHash`: String (SHA-256 hash of token)
- `expiresAt`: Date (1 hour TTL)
- `used`: Boolean

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` — Register customer account (returns JWT + sanitized user)
- `POST /login` — Login user or admin
- `POST /forgot-password` — Dispatch secure password reset token email
- `POST /reset-password` — Reset password using token
- `GET /me` — Get current logged-in user profile [Protected]
- `PATCH /profile` — Update address & profile details [Protected]

### Admin Operations (`/api/admin`)
- `POST /login` — Dedicated administrator login
- `GET /stats` — Aggregated revenue, orders by status, low stock count [Admin]
- `GET /orders` — Filtered orders list with user details [Admin]
- `PATCH /orders/:id/status` — Advance order status and emit real-time Socket.IO event [Admin]

### Pizza Catalog (`/api/pizzas`)
- `GET /` — Get all pizzas with search and category filters
- `GET /:id` — Get single pizza details
- `GET /customizer/options` — Get all bases, sauces, cheeses, and toppings from inventory

### Orders & Payments (`/api/orders`, `/api/payments`)
- `POST /api/payments/create-order` — Verify stock, recalculate price, generate Razorpay order [Protected]
- `POST /api/payments/verify` — Verify HMAC signature, confirm order, auto-deduct inventory [Protected]
- `GET /api/orders/my-orders` — Get customer's order history [Protected]
- `GET /api/orders/:id` — Get order detail with real-time status [Protected]
- `PATCH /api/orders/:id/cancel` — Cancel order if still in `'Order Received'` [Protected]

### Inventory Management (`/api/inventory`)
- `GET /` — List inventory with stock percentages
- `POST /` — Add new ingredient [Admin]
- `PATCH /:id` — Update ingredient details/threshold [Admin]
- `POST /:id/restock` — Quick restock (+10, +50) [Admin]
- `DELETE /:id` — Remove ingredient [Admin]

---

## Installation & Setup

### Prerequisites
- **Node.js** v18+ or v24+
- **MongoDB** running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone & Configure Environment
```bash
# Create .env in server directory
cp server/.env.example server/.env
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Seed Database
```bash
# In server directory:
npm run seed
```
**Seeded Credentials:**
- 👑 **Admin Account**: `admin@pizzanest.com` | `Admin@123456`
- 👤 **Demo User**: `user@pizzanest.com` | `User@123456`

### 4. Run Application
```bash
# Terminal 1 - Start Backend Server (Port 5000):
cd server
npm run dev

# Terminal 2 - Start Frontend Client (Port 5173):
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Demo Video Script & Sequence

For the **OASIS INFOBYTE Internship Demo Video**:

1. **Title Card (2 Seconds)**:
   > **[YOUR FULL NAME]**
   > Web Development & Designing Internship
   > Level 3 — Pizza Delivery Full-Stack Application

2. **Landing Page**: Showcase hero section, why choose us, 4-step customizer promo, and featured pizzas.
3. **User Authentication**: Demonstrate registration / login using the demo buttons.
4. **Interactive Customizer**:
   - Step 1: Select crust (e.g. *Cheese Burst*).
   - Step 2: Select sauce (e.g. *Spicy Arrabbiata*).
   - Step 3: Select cheese (e.g. *Aged Cheddar*).
   - Step 4: Multi-select toppings (*Mushrooms, Jalapeños, Olives*).
   - Show dynamic live pricing update and Add to Cart with confetti animation.
5. **Cart & Checkout**:
   - Inspect itemized customizations in cart.
   - Enter delivery address and click *"Pay with Razorpay"*.
   - Complete the Razorpay test-mode payment.
6. **Live Order Tracking**:
   - Watch the animated progress bar in `'Order Received'` state.
7. **Admin Dashboard & Inventory (Split Screen / Second Tab)**:
   - Login to `/admin/login` using `admin@pizzanest.com` / `Admin@123456`.
   - Show the KPI stats and live inventory levels (notice ingredients were automatically deducted!).
   - Show incoming order in the live queue.
   - Click to advance status: `'Order Received'` ➔ `'In Kitchen'` ➔ `'Sent to Delivery'`.
8. **Real-Time Synchronisation**:
   - Show customer tracking page updating instantly without browser refresh.
9. **Low-Stock Alert**:
   - Demonstrate quick restock (+10, +50) or show email notification logs.

---

## Recommended Git Commit Sequence

1. `feat: initial monorepo structure and dependencies setup`
2. `feat: express server and mongodb mongoose schemas`
3. `feat: jwt authentication and rbac middleware`
4. `feat: pizza catalog, customizer options, and database seed script`
5. `feat: razorpay test payment integration and hmac verification`
6. `feat: automated inventory deduction and restock services`
7. `feat: node-cron scheduled low-stock alert notifier with nodemailer`
8. `feat: socket.io real-time order tracking synchronization`
9. `feat: react client design system and responsive navigation`
10. `feat: landing page and pizza menu dashboard`
11. `feat: interactive 4-step pizza customizer studio with live stage preview`
12. `feat: shopping cart and checkout with razorpay modal`
13. `feat: real-time animated order tracking component`
14. `feat: admin operations portal, kpi dashboard, and inventory studio`
15. `feat: end-to-end testing, error handling, and documentation`

---

## Internship Requirements Checklist

### OASIS INFOBYTE LEVEL 3 CHECKLIST

#### USER SIDE:
- [x] User registration with validation and error handling
- [x] User login with JWT authorization
- [x] Forgot password & secure token reset flow via Nodemailer
- [x] Pizza dashboard with search and category filtering
- [x] Pizza base selection — 5 options (*Thin Crust, Classic, Cheese Burst, Whole Wheat, Gluten Free*)
- [x] Sauce selection — 5 options (*Classic Tomato, Arrabbiata, Alfredo, BBQ, Pesto*)
- [x] Cheese selection (*Mozzarella, Cheddar, Parmesan, Gouda, Vegan*)
- [x] Multiple vegetable selection (*Onion, Capsicum, Mushroom, Corn, Jalapeño, Olives, Tomato, Spinach*)
- [x] Order summary with server-side price recalculation
- [x] Razorpay test-mode checkout & HMAC verification
- [x] Real-time order status tracking with animated visual tracker

#### ADMIN SIDE:
- [x] Separate admin login with RBAC authorization
- [x] Inventory dashboard with KPI cards and revenue metrics
- [x] Pizza base inventory tracking
- [x] Sauce inventory tracking
- [x] Cheese inventory tracking
- [x] Vegetable inventory tracking
- [x] Automatic stock deduction upon confirmed order
- [x] Manual stock updates & quick restock buttons (+10, +50)
- [x] Configurable low-stock threshold per ingredient
- [x] Automated low-stock email notification via `node-cron` & Nodemailer
- [x] Order management panel with customer & customization details
- [x] Admin order status updates (`Order Received` ➔ `In Kitchen` ➔ `Sent to Delivery` ➔ `Delivered`)
- [x] Real-time status reflected on user dashboard via Socket.IO without page refresh

---

## License & Acknowledgements
Developed for the **OASIS INFOBYTE Internship in Web Development & Designing**.
All rights reserved &bull; 2026.
