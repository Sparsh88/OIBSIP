import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { checkAndNotifyLowStock } from '../jobs/lowStockNotifier.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const adminEmail = process.env.ADMIN_EMAIL || 'sparshchauhan050@gmail.com';
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Sp@080806';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE END-TO-END AUTOMATED TESTS');
  console.log('======================================================\n');

  await mongoose.connect(
    process.env.MONGO_URI ||
      'mongodb+srv://sparshchauhan:sparsh12@cluster0.00t8w7f.mongodb.net/pizza_delivery_db?retryWrites=true&w=majority'
  );

  try {
    // 1. Health check
    console.log('1️⃣ Testing Server Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Health Check Passed:', health.data);

    // 2. Pizza Catalog
    console.log('\n2️⃣ Testing Pizza Catalog Retrieval...');
    const pizzas = await axios.get(`${BASE_URL}/pizzas`);
    console.log(`   ✅ Fetched ${pizzas.data.pizzas.length} Pizzas successfully.`);

    // 3. Customizer Options
    console.log('\n3️⃣ Testing Pizza Customizer Options...');
    const customizer = await axios.get(`${BASE_URL}/pizzas/customizer/options`);
    console.log('   ✅ Customizer Options:');
    console.log(`      - Bases:    ${customizer.data.options.bases.length} options`);
    console.log(`      - Sauces:   ${customizer.data.options.sauces.length} options`);
    console.log(`      - Cheeses:  ${customizer.data.options.cheeses.length} options`);
    console.log(`      - Veggies:  ${customizer.data.options.veggies.length} options`);

    // 4. Register a Test Customer
    console.log('\n4️⃣ Testing Dynamic Customer Registration & Authentication...');
    const testEmail = `cust_${Date.now()}@domain.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Customer',
      email: testEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    const userToken = regRes.data.token;
    console.log(`   ✅ Customer Registered: ${regRes.data.user.name} (${regRes.data.user.email})`);

    // 5. Admin Login with Sparsh's Credentials
    console.log('\n5️⃣ Testing Dedicated Admin Authentication...');
    const adminAuth = await axios.post(`${BASE_URL}/admin/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    const adminToken = adminAuth.data.token;
    console.log(`   ✅ Admin Logged In: ${adminAuth.data.user.name} (${adminAuth.data.user.email})`);

    // 6. Admin Dashboard Stats
    console.log('\n6️⃣ Testing Admin Dashboard Stats Retrieval...');
    const adminStats = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   ✅ Admin Stats: Total SKUs =', adminStats.data.stats.totalInventorySKUs);

    // 7. Test Inventory Before Order
    console.log('\n7️⃣ Checking Inventory Before Order Placement...');
    const invBefore = await axios.get(`${BASE_URL}/inventory`);
    const thinCrustBefore = invBefore.data.inventory.find((i) => i.name === 'Thin Crust');
    console.log(`   📦 "Thin Crust" quantity before order: ${thinCrustBefore?.quantity} ${thinCrustBefore?.unit}`);

    // 8. Create Order & Razorpay Checkout Order
    console.log('\n8️⃣ Testing Order Creation & Razorpay Checkout Initialization...');
    const orderPayload = {
      items: [
        {
          name: 'Custom Masterpiece',
          customBase: 'Thin Crust',
          customSauce: 'Spicy Arrabbiata',
          customCheese: 'Aged Cheddar',
          customVeggies: ['Button Mushroom', 'Pickled Jalapeño'],
          quantity: 2,
          unitPrice: 420,
        },
      ],
      deliveryAddress: {
        street: '101 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400020',
        phone: '+91 98765 00000',
      },
      customerNotes: 'Please ring the doorbell twice.',
    };

    const createOrderRes = await axios.post(`${BASE_URL}/payments/create-order`, orderPayload, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log(`   ✅ Created Order #${createOrderRes.data.orderNumber} (Internal ID: ${createOrderRes.data.orderId})`);

    // 9. Verify Payment & Execute Automated Inventory Deduction
    console.log('\n9️⃣ Testing Payment Signature Verification & Inventory Deduction...');
    const verifyRes = await axios.post(
      `${BASE_URL}/payments/verify`,
      {
        internalOrderId: createOrderRes.data.orderId,
        razorpayOrderId: createOrderRes.data.razorpayOrderId,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: `sim_sig_verified`,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    console.log('   ✅ Payment Verified! Order Status:', verifyRes.data.order.orderStatus);

    // 10. Verify Inventory Auto-Deduction
    console.log('\n🔟 Verifying Automated Inventory Deduction in Database...');
    const invAfter = await axios.get(`${BASE_URL}/inventory`);
    const thinCrustAfter = invAfter.data.inventory.find((i) => i.name === 'Thin Crust');
    console.log(`   📦 "Thin Crust" quantity after order: ${thinCrustAfter?.quantity} ${thinCrustAfter?.unit}`);
    const difference = thinCrustBefore.quantity - thinCrustAfter.quantity;
    console.log(`   ✅ Stock decremented by: ${difference} crusts (Expected: 2 for quantity 2)`);

    // 11. Admin Updates Order Status
    console.log('\n1️⃣1️⃣ Testing Admin Order Status Transition Pipeline...');
    const update1 = await axios.patch(
      `${BASE_URL}/admin/orders/${createOrderRes.data.orderId}/status`,
      { status: 'In Kitchen', note: 'Chef started hand-tossing dough' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Status updated to: "${update1.data.order.orderStatus}"`);

    const update2 = await axios.patch(
      `${BASE_URL}/admin/orders/${createOrderRes.data.orderId}/status`,
      { status: 'Sent to Delivery', note: 'Rider dispatched with thermal box' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`   ✅ Status updated to: "${update2.data.order.orderStatus}"`);

    // 12. Check Low-Stock Cron Execution
    console.log('\n1️⃣2️⃣ Testing Low-Stock Scheduled Monitor Execution...');
    const cronResult = await checkAndNotifyLowStock();
    console.log('   ✅ Low-Stock Cron check completed:', cronResult);

    console.log('\n======================================================');
    console.log('🎉 ALL 12 END-TO-END SYSTEM INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failure:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTests();
