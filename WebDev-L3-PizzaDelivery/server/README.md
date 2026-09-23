# PizzaNest Backend API

RESTful API and Real-Time WebSocket backend service for the **OASIS INFOBYTE Level 3 Pizza Delivery Full-Stack Application**.

## Features
- **Authentication**: JWT Auth + bcrypt password encryption, RBAC (User vs Admin).
- **Password Recovery**: Secure token generation with 1-hour expiration and Nodemailer email dispatch.
- **Pizza Catalog & Customizer API**: Dynamic retrieval of pizzas, bases, sauces, cheeses, and toppings with pricing.
- **Payment & Verification**: Razorpay Test Mode checkout order creation and HMAC-SHA256 signature verification.
- **Automated Inventory Engine**: Auto-deduction of recipe ingredients on verified payment.
- **Real-Time WebSockets**: Socket.IO order tracking room broadcasts.
- **Scheduled Background Monitoring**: `node-cron` low-stock checker with email alert cooldown.

## Environment Setup
Create `.env` based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pizza_delivery_db
JWT_SECRET=pizzanest_super_secret_jwt_key_level3_2026
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourSecret
```

## Running Backend
```bash
# Install dependencies
npm install

# Seed initial database (Admin, Demo User, Pizzas, Inventory)
npm run seed

# Run server with watch mode
npm run dev
```
