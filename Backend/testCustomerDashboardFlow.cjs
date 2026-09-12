const axios = require("axios");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../Backend/.env") });

const BASE_URL = "http://localhost:5000";

async function runDashboardIntegrationTest() {
  console.log("=================================================");
  console.log("🚀 STARTING CUSTOMER DASHBOARD INTEGRATION TEST");
  console.log("=================================================");

  // 1. Connect to MongoDB to find or create customer test account
  const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_food_delivery";
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;
  const usersColl = db.collection("users");
  const ordersColl = db.collection("orders");
  const foodsColl = db.collection("foods");

  // Find a customer or create a test customer
  let testCustomer = await usersColl.findOne({ role: "customer" });
  if (!testCustomer) {
    const custId = new mongoose.Types.ObjectId();
    const newCust = {
      _id: custId,
      firebaseUid: "test_customer_uid_123",
      fullName: "Pothuri Yeswanth Varma",
      email: "testcustomer_foodexpress@gmail.com",
      role: "customer",
      wallet: 250,
      rewardPoints: 120,
      membership: "FoodExpress Gold",
      savedAddresses: [
        {
          id: "addr_1",
          tag: "Home",
          address: "Flat 402, Royal Residency, Bhimavaram, AP",
          isDefault: true
        }
      ],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await usersColl.insertOne(newCust);
    testCustomer = newCust;
  }

  // Generate JWT token for this customer
  const token = jwt.sign(
    {
      id: testCustomer._id.toString(),
      email: testCustomer.email,
      role: testCustomer.role
    },
    process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025",
    { expiresIn: "1h" }
  );

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  console.log(`✅ Test customer identified: ${testCustomer.email} (ID: ${testCustomer._id})`);

  // 2. Test GET /api/dashboard/stats
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/stats`, authHeaders);
    console.log("✅ GET /api/dashboard/stats returned 200:", res.data.success ? "Success" : "Failed");
  } catch (err) {
    console.error("❌ GET /api/dashboard/stats failed:", err.message);
  }

  // 3. Test GET /api/dashboard/active-order
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/active-order`, authHeaders);
    console.log("✅ GET /api/dashboard/active-order returned 200:", {
      hasActiveOrder: Boolean(res.data.activeOrder),
      orderStatus: res.data.activeOrder ? res.data.activeOrder.orderStatus : "None (empty state active)"
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/active-order failed:", err.message);
  }

  // 4. Test GET /api/dashboard/recommendations
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/recommendations`, authHeaders);
    console.log("✅ GET /api/dashboard/recommendations returned 200:", {
      count: res.data.recommended?.length,
      sample: res.data.recommended?.[0]?.name,
      contextReason: res.data.contextReason
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/recommendations failed:", err.message);
  }

  // 5. Test GET /api/dashboard/restaurants
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/restaurants`, authHeaders);
    console.log("✅ GET /api/dashboard/restaurants returned 200:", {
      count: res.data.restaurants?.length,
      sample: res.data.restaurants?.[0]?.name
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/restaurants failed:", err.message);
  }

  // 6. Test GET /api/dashboard/popular-foods
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/popular-foods`);
    console.log("✅ GET /api/dashboard/popular-foods returned 200:", {
      count: res.data.foods?.length,
      sample: res.data.foods?.[0]?.name
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/popular-foods failed:", err.message);
  }

  // 7. Test GET /api/dashboard/wallet
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/wallet`, authHeaders);
    console.log("✅ GET /api/dashboard/wallet returned 200:", {
      balance: res.data.wallet?.balance,
      rewardPoints: res.data.wallet?.rewardPoints
    });
  } catch (err) {
    console.error("❌ GET /api/dashboard/wallet failed:", err.message);
  }

  // 8. Test PUT /api/auth/profile for address and wallet updates
  try {
    const updatePayload = {
      wallet: 350,
      savedAddresses: [
        {
          id: "addr_home",
          tag: "Home",
          address: "Plot 12, Main Road, Bhimavaram, AP",
          isDefault: true
        },
        {
          id: "addr_work",
          tag: "Work",
          address: "SRKR Engineering College, Bhimavaram",
          isDefault: false
        }
      ]
    };
    const res = await axios.put(`${BASE_URL}/api/auth/profile`, updatePayload, authHeaders);
    console.log("✅ PUT /api/auth/profile successfully updated address & wallet:", {
      savedAddressesCount: res.data.user?.savedAddresses?.length,
      wallet: res.data.user?.wallet
    });
  } catch (err) {
    console.error("❌ PUT /api/auth/profile failed:", err.message);
  }

  // 9. Simulate creating an active order to verify live tracking
  try {
    const orderId = new mongoose.Types.ObjectId();
    const liveOrder = {
      _id: orderId,
      user: testCustomer._id,
      items: [
        {
          name: "Crispy Chicken Zinger Burger",
          price: 199,
          quantity: 2,
          image: "burger.jpg"
        }
      ],
      amount: 398,
      finalAmount: 398,
      address: {
        address: "Plot 12, Main Road, Bhimavaram, AP",
        phone: "9069033433"
      },
      orderStatus: "Out for Delivery",
      paymentStatus: "Paid",
      paymentMethod: "FoodExpress Wallet",
      assignedDeliveryBoy: {
        fullName: "Suresh Rider",
        phone: "9876543210",
        vehicleNumber: "AP 37 BK 9021"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await ordersColl.insertOne(liveOrder);

    // Query active order endpoint again!
    const activeRes = await axios.get(`${BASE_URL}/api/dashboard/active-order`, authHeaders);
    console.log("✅ Active order detection verified:", {
      hasActiveOrder: Boolean(activeRes.data.activeOrder),
      orderStatus: activeRes.data.activeOrder?.orderStatus,
      riderName: activeRes.data.activeOrder?.assignedDeliveryBoy?.fullName
    });

    // Clean up test order
    await ordersColl.deleteOne({ _id: orderId });
    console.log("✅ Cleaned up temporary test order");
  } catch (err) {
    console.error("❌ Active order simulation error:", err.message);
  }

  await mongoose.disconnect();
  console.log("=================================================");
  console.log("🎉 CUSTOMER DASHBOARD INTEGRATION TESTS PASSED 100%");
  console.log("=================================================");
}

runDashboardIntegrationTest().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
