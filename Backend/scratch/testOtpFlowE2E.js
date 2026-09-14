import mongoose from "mongoose";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import DeliveryPartner from "../models/DeliveryPartner.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import {
  generateDeliveryOtp,
  hashDeliveryOtp,
  encryptDeliveryOtp,
  decryptDeliveryOtp
} from "../utils/deliveryOtpUtils.js";

dotenv.config();

const API_BASE = "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025";

const genToken = (id, role = "customer") =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });

// Summary tracking
const testResults = [];
function recordResult(num, name, passed, details = "") {
  testResults.push({ num, name, passed, details });
  const mark = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`\n${mark} [Test ${num}]: ${name}`);
  if (details) console.log(`   Details: ${details}`);
}

async function runE2ETests() {
  console.log("=================================================================");
  console.log("🚀 STARTING E2E TEST SUITE FOR SECURE DELIVERY OTP SYSTEM");
  console.log("=================================================================");

  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_food_delivery"
  );
  console.log("✓ Connected to MongoDB directly for verification");

  // Clean up existing test records
  await User.deleteMany({
    email: {
      $in: [
        "e2e_cust_a@test.com",
        "e2e_cust_b@test.com",
        "e2e_driver_a@test.com",
        "e2e_driver_b@test.com",
        "e2e_rest_owner@test.com",
        "e2e_admin@test.com"
      ]
    }
  });
  await DeliveryPartner.deleteMany({
    email: { $in: ["e2e_driver_a@test.com", "e2e_driver_b@test.com"] }
  });
  await Restaurant.deleteMany({ email: "e2e_rest@test.com" });

  // 1. Create Test Entities
  const custA = await User.create({
    fullName: "Customer Alice",
    email: "e2e_cust_a@test.com",
    role: "customer",
    isVerified: true
  });
  const tokenCustA = genToken(custA._id, "customer");

  const custB = await User.create({
    fullName: "Customer Bob",
    email: "e2e_cust_b@test.com",
    role: "customer",
    isVerified: true
  });
  const tokenCustB = genToken(custB._id, "customer");

  const userDriverA = await User.create({
    fullName: "Rider Aaron",
    email: "e2e_driver_a@test.com",
    role: "delivery",
    isVerified: true
  });
  const partnerA = await DeliveryPartner.create({
    userId: userDriverA._id,
    name: "Rider Aaron",
    email: "e2e_driver_a@test.com",
    phone: "9100000001",
    vehicleType: "Bike",
    vehicleNumber: "TS09EA1111",
    status: "approved",
    availabilityStatus: "online",
    isAvailable: true,
    wallet: { balance: 0, totalEarned: 0, pendingPayout: 0 }
  });
  const tokenDriverA = genToken(userDriverA._id, "delivery");

  const userDriverB = await User.create({
    fullName: "Rider Ben",
    email: "e2e_driver_b@test.com",
    role: "delivery",
    isVerified: true
  });
  const partnerB = await DeliveryPartner.create({
    userId: userDriverB._id,
    name: "Rider Ben",
    email: "e2e_driver_b@test.com",
    phone: "9100000002",
    vehicleType: "Scooter",
    vehicleNumber: "TS09EB2222",
    status: "approved",
    availabilityStatus: "online",
    isAvailable: true,
    wallet: { balance: 0, totalEarned: 0, pendingPayout: 0 }
  });
  const tokenDriverB = genToken(userDriverB._id, "delivery");

  const restOwner = await User.create({
    fullName: "Chef Marco",
    email: "e2e_rest_owner@test.com",
    role: "restaurant",
    isVerified: true
  });
  const restaurant = await Restaurant.create({
    ownerId: restOwner._id,
    name: "E2E Trattoria",
    email: "e2e_rest@test.com",
    phone: "9100000003",
    status: "approved",
    isActive: true,
    address: { street: "123 Food Street", city: "Hyderabad", state: "TS", pincode: "500081" }
  });
  const tokenRest = genToken(restOwner._id, "restaurant");

  const adminUser = await User.create({
    fullName: "Admin Officer",
    email: "e2e_admin@test.com",
    role: "admin",
    isVerified: true
  });
  const tokenAdmin = genToken(adminUser._id, "admin");

  console.log("✓ Test users & partners setup completed.");

  // Helper to create an order
  const createTestOrder = async (cust, partner, status = "Ready for Pickup", deliveryStatus = "Arrived at Customer") => {
    const rawOtp = generateDeliveryOtp();
    const tempId = new mongoose.Types.ObjectId();
    const hash = hashDeliveryOtp(rawOtp, tempId.toString());
    const enc = encryptDeliveryOtp(rawOtp);

    const order = await Order.create({
      _id: tempId,
      user: cust._id,
      deliveryPartner: partner ? partner._id : null,
      deliveryAddress: {
        fullName: cust.fullName,
        phone: "9998887776",
        addressLine1: "Flat 402, Highrise",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500081"
      },
      items: [
        {
          food: new mongoose.Types.ObjectId(),
          name: "Signature Pasta",
          image: "pasta.jpg",
          price: 250,
          quantity: 2,
          subtotal: 500,
          restaurantId: restaurant._id
        }
      ],
      totalAmount: 500,
      finalAmount: 540,
      deliveryCharge: 40,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: status,
      deliveryStatus: deliveryStatus,
      delivery: {
        deliveryPartner: partner ? partner._id : null,
        status: deliveryStatus,
        otpHash: hash,
        otpEncrypted: enc,
        otpGeneratedAt: new Date(),
        otpExpiresAt: new Date(Date.now() + 86400000),
        otpAttempts: 0,
        otpLockedUntil: null,
        otpVerifiedAt: null
      }
    });
    return { order, rawOtp };
  };

  // =========================================================================
  // TEST 1: Order Creation & OTP Access Isolation
  // =========================================================================
  try {
    const { order: order1, rawOtp: rawOtp1 } = await createTestOrder(custA, partnerA);

    // Customer A fetches OTP
    const custRes = await axios.get(`${API_BASE}/api/orders/${order1._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${tokenCustA}` }
    });
    const custOtp = custRes.data.otp;

    // Driver A fetches order details
    const driverRes = await axios.get(`${API_BASE}/api/delivery-partner/orders/${order1._id}`, {
      headers: { Authorization: `Bearer ${tokenDriverA}` }
    });
    const driverOrderData = driverRes.data.order || driverRes.data.data;

    // Inspect DB record directly
    const dbOrder = await Order.findById(order1._id).lean();

    const passCustOtp = custOtp === rawOtp1 && /^\d{6}$/.test(custOtp);
    const passDriverLeak =
      driverOrderData.deliveryOtp === undefined &&
      driverOrderData.delivery?.otpHash === undefined &&
      driverOrderData.delivery?.otpEncrypted === undefined;
    const passDbPlaintext =
      dbOrder.deliveryOtp === undefined &&
      dbOrder.delivery?.otpHash !== undefined &&
      dbOrder.delivery?.otpEncrypted !== undefined;

    const pass1 = passCustOtp && passDriverLeak && passDbPlaintext;
    recordResult(
      1,
      "Order creation generates secure 6-digit OTP; Customer views OTP; Driver & DB do not leak plain OTP",
      pass1,
      `Customer received: ${custOtp}, Driver leak prevented: ${passDriverLeak}, DB hash stored: ${Boolean(dbOrder.delivery?.otpHash)}`
    );
  } catch (err) {
    recordResult(1, "Order creation & OTP isolation", false, err.response?.data?.message || err.message);
  }

  // =========================================================================
  // TEST 2: Driver attempts to mark Delivered WITHOUT OTP -> REJECTED (400)
  // =========================================================================
  try {
    const { order: order2 } = await createTestOrder(custA, partnerA, "Out for Delivery", "Arrived at Customer");

    let rejected1 = false;
    let rejected2 = false;

    try {
      await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${order2._id}/status`,
        { deliveryStatus: "Delivered" },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } }
      );
    } catch (e) {
      if (e.response?.status === 400 && e.response?.data?.message?.includes("OTP")) {
        rejected1 = true;
      }
    }

    try {
      await axios.put(
        `${API_BASE}/api/delivery/orders/${order2._id}/status`,
        { orderStatus: "Delivered" },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } }
      );
    } catch (e) {
      if (e.response?.status === 400 && e.response?.data?.message?.includes("OTP")) {
        rejected2 = true;
      }
    }

    const checkDb = await Order.findById(order2._id);
    const statusUnchanged = checkDb.orderStatus !== "Delivered" && checkDb.deliveryStatus !== "Delivered";

    const pass2 = rejected1 && rejected2 && statusUnchanged;
    recordResult(
      2,
      "Driver bypass attempt without OTP verification is strictly rejected (HTTP 400)",
      pass2,
      `deliveryPartner route rejected: ${rejected1}, delivery route rejected: ${rejected2}, DB status remains: ${checkDb.orderStatus}`
    );
  } catch (err) {
    recordResult(2, "Driver bypass without OTP", false, err.message);
  }

  // =========================================================================
  // TEST 3: Driver enters WRONG OTP -> REJECTED (400), Order remains active
  // =========================================================================
  try {
    const { order: order3 } = await createTestOrder(custA, partnerA, "Out for Delivery", "Arrived at Customer");

    let rejectedWrongOtp = false;
    let errorMsg = "";
    try {
      await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${order3._id}/verify-otp`,
        { otp: "123890" },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } }
      );
    } catch (e) {
      if (e.response?.status === 400) {
        rejectedWrongOtp = true;
        errorMsg = e.response?.data?.message;
      }
    }

    const checkDb = await Order.findById(order3._id);
    const pass3 =
      rejectedWrongOtp &&
      checkDb.orderStatus !== "Delivered" &&
      checkDb.delivery?.otpAttempts === 1;

    recordResult(
      3,
      "Driver enters wrong OTP -> REJECTED (400), order remains active, attempts incremented",
      pass3,
      `Rejected: ${rejectedWrongOtp}, Msg: "${errorMsg}", Attempts count: ${checkDb.delivery?.otpAttempts}`
    );
  } catch (err) {
    recordResult(3, "Wrong OTP test", false, err.message);
  }

  // =========================================================================
  // TEST 4: Driver enters CORRECT OTP -> SUCCESS (200), Delivered & Earnings credited
  // =========================================================================
  try {
    const { order: order4, rawOtp: rawOtp4 } = await createTestOrder(custA, partnerA, "Out for Delivery", "Arrived at Customer");

    const prevWallet = (await DeliveryPartner.findById(partnerA._id)).walletBalance || 0;

    const res = await axios.post(
      `${API_BASE}/api/delivery-partner/orders/${order4._id}/verify-otp`,
      { otp: rawOtp4 },
      { headers: { Authorization: `Bearer ${tokenDriverA}` } }
    );

    const updatedDb = await Order.findById(order4._id);
    const updatedPartner = await DeliveryPartner.findById(partnerA._id);
    const txn = await Transaction.findOne({ order: order4._id });

    const passStatus = updatedDb.orderStatus === "Delivered" && updatedDb.deliveryStatus === "Delivered";
    const passVerifiedAt = Boolean(updatedDb.delivery?.otpVerifiedAt);
    const passWallet = updatedPartner.walletBalance > prevWallet;
    const passTxn = Boolean(txn && txn.type === "credit");

    const pass4 = res.status === 200 && passStatus && passVerifiedAt && passWallet && passTxn;
    recordResult(
      4,
      "Driver enters correct OTP -> SUCCESS (200), order marked Delivered, driver wallet credited & Transaction logged",
      pass4,
      `Status: ${updatedDb.orderStatus}, VerifiedAt: ${updatedDb.delivery?.otpVerifiedAt?.toISOString()}, Wallet: ₹${prevWallet} -> ₹${updatedPartner.walletBalance}, Txn: ${txn?._id}`
    );
  } catch (err) {
    recordResult(4, "Correct OTP verification", false, err.response?.data?.message || err.message);
  }

  // =========================================================================
  // TEST 5: Re-verifying already delivered order -> REJECTED (400)
  // =========================================================================
  try {
    const { order: order5, rawOtp: rawOtp5 } = await createTestOrder(custA, partnerA, "Delivered", "Delivered");
    order5.delivery.otpVerifiedAt = new Date();
    await order5.save();

    let rejectedReverify = false;
    try {
      await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${order5._id}/verify-otp`,
        { otp: rawOtp5 },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } }
      );
    } catch (e) {
      if (
        e.response?.status === 400 &&
        (e.response?.data?.message?.includes("already been marked as delivered") ||
          e.response?.data?.message?.includes("already been delivered"))
      ) {
        rejectedReverify = true;
      }
    }

    recordResult(
      5,
      "Re-verifying an already delivered order is rejected (HTTP 400)",
      rejectedReverify,
      `Re-verify rejected: ${rejectedReverify}`
    );
  } catch (err) {
    recordResult(5, "Re-verify delivered order", false, err.message);
  }

  // =========================================================================
  // TEST 6: Driver A attempts to verify Driver B's order -> REJECTED (403)
  // =========================================================================
  try {
    const { order: order6, rawOtp: rawOtp6 } = await createTestOrder(custA, partnerB, "Out for Delivery", "Arrived at Customer");

    let rejectedDriverCross = false;
    try {
      await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${order6._id}/verify-otp`,
        { otp: rawOtp6 },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } } // Driver A verifying Driver B's order
      );
    } catch (e) {
      if (e.response?.status === 403) {
        rejectedDriverCross = true;
      }
    }

    recordResult(
      6,
      "Driver A verifying Driver B's order is strictly rejected (HTTP 403 Forbidden)",
      rejectedDriverCross,
      `Unauthorized driver verification rejected: ${rejectedDriverCross}`
    );
  } catch (err) {
    recordResult(6, "Driver cross-verification", false, err.message);
  }

  // =========================================================================
  // TEST 7: Customer A attempts to view Customer B's OTP -> REJECTED (403)
  // =========================================================================
  try {
    const { order: order7 } = await createTestOrder(custB, partnerA);

    let rejectedCustomerCross = false;
    try {
      await axios.get(`${API_BASE}/api/orders/${order7._id}/delivery-otp`, {
        headers: { Authorization: `Bearer ${tokenCustA}` } // Customer A accessing Customer B's order
      });
    } catch (e) {
      if (e.response?.status === 403) {
        rejectedCustomerCross = true;
      }
    }

    recordResult(
      7,
      "Customer A viewing Customer B's OTP is strictly rejected (HTTP 403 Forbidden)",
      rejectedCustomerCross,
      `Unauthorized customer OTP view rejected: ${rejectedCustomerCross}`
    );
  } catch (err) {
    recordResult(7, "Customer cross-order OTP access", false, err.message);
  }

  // =========================================================================
  // TEST 8: Restaurant attempts to mark order Delivered -> REJECTED (403/400)
  // =========================================================================
  try {
    const { order: order8 } = await createTestOrder(custA, partnerA, "Out for Delivery", "Arrived at Customer");

    let rejectedRestDelivered = false;
    try {
      await axios.put(
        `${API_BASE}/api/orders/${order8._id}/status`,
        { orderStatus: "Delivered" },
        { headers: { Authorization: `Bearer ${tokenRest}` } }
      );
    } catch (e) {
      if ([400, 403].includes(e.response?.status)) {
        rejectedRestDelivered = true;
      }
    }

    const checkDb = await Order.findById(order8._id);
    const pass8 = rejectedRestDelivered && checkDb.orderStatus !== "Delivered";

    recordResult(
      8,
      "Restaurant partner attempting to mark order Delivered is strictly rejected",
      pass8,
      `Restaurant bypass rejected: ${rejectedRestDelivered}, DB status remains: ${checkDb.orderStatus}`
    );
  } catch (err) {
    recordResult(8, "Restaurant delivery bypass", false, err.message);
  }

  // =========================================================================
  // TEST 9: Admin attempts Delivered without OTP -> REJECTED; Emergency Override -> ALLOWED
  // =========================================================================
  try {
    const { order: order9 } = await createTestOrder(custA, partnerA, "Out for Delivery", "Arrived at Customer");

    let rejectedAdminWithoutOtp = false;
    try {
      await axios.put(
        `${API_BASE}/api/admin/orders/${order9._id}/status`,
        { status: "Delivered" },
        { headers: { Authorization: `Bearer ${tokenAdmin}` } }
      );
    } catch (e) {
      if (e.response?.status === 400 && e.response?.data?.message?.includes("OTP")) {
        rejectedAdminWithoutOtp = true;
      }
    }

    // Now execute emergency override with audit reason
    const overrideRes = await axios.put(
      `${API_BASE}/api/admin/orders/${order9._id}/status`,
      {
        status: "Delivered",
        emergencyOverride: true,
        overrideReason: "Verified customer received food during cellular connectivity disruption"
      },
      { headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );

    const checkDb = await Order.findById(order9._id);
    const passOverride =
      overrideRes.status === 200 &&
      checkDb.orderStatus === "Delivered" &&
      Boolean(checkDb.delivery?.emergencyOverride) &&
      checkDb.delivery?.emergencyOverride?.reason?.includes("cellular connectivity disruption");

    const pass9 = rejectedAdminWithoutOtp && passOverride;
    recordResult(
      9,
      "Admin normal delivery without OTP rejected (400); Admin emergency override succeeds with audited reason",
      pass9,
      `Normal update rejected: ${rejectedAdminWithoutOtp}, Emergency override accepted: ${passOverride}, Audit reason recorded: "${checkDb.delivery?.emergencyOverride?.reason}"`
    );
  } catch (err) {
    recordResult(9, "Admin delivery & emergency override", false, err.message);
  }

  // =========================================================================
  // TEST 10: Customer page refresh / re-fetch returns SAME valid OTP
  // =========================================================================
  try {
    const { order: order10, rawOtp: rawOtp10 } = await createTestOrder(custA, partnerA);

    const fetch1 = await axios.get(`${API_BASE}/api/orders/${order10._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${tokenCustA}` }
    });
    const fetch2 = await axios.get(`${API_BASE}/api/orders/${order10._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${tokenCustA}` }
    });

    const pass10 =
      fetch1.data.otp === rawOtp10 &&
      fetch2.data.otp === rawOtp10 &&
      fetch1.data.otp === fetch2.data.otp;

    recordResult(
      10,
      "Customer refresh / multiple requests consistently return the SAME valid OTP",
      pass10,
      `Fetch 1: ${fetch1.data.otp}, Fetch 2: ${fetch2.data.otp}, Target: ${rawOtp10}`
    );
  } catch (err) {
    recordResult(10, "Page refresh / idempotent OTP fetch", false, err.message);
  }

  // =========================================================================
  // TEST 11: Customer re-login simulation returns SAME valid OTP
  // =========================================================================
  try {
    const { order: order11, rawOtp: rawOtp11 } = await createTestOrder(custA, partnerA);

    // Simulate new login token
    const newTokenCustA = genToken(custA._id, "customer");

    const reLoginFetch = await axios.get(`${API_BASE}/api/orders/${order11._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${newTokenCustA}` }
    });

    const pass11 = reLoginFetch.data.otp === rawOtp11;
    recordResult(
      11,
      "Customer re-login preserves valid delivery OTP for active order",
      pass11,
      `OTP after re-login: ${reLoginFetch.data.otp}`
    );
  } catch (err) {
    recordResult(11, "Customer re-login", false, err.message);
  }

  // =========================================================================
  // TEST 12: Backend persistence / restart simulation
  // =========================================================================
  try {
    const { order: order12, rawOtp: rawOtp12 } = await createTestOrder(custA, partnerA);

    // Read directly from MongoDB without cached objects
    const freshDbOrder = await Order.findById(order12._id).lean();
    const decryptedOtp = decryptDeliveryOtp(freshDbOrder.delivery.otpEncrypted);

    const pass12 = decryptedOtp === rawOtp12;
    recordResult(
      12,
      "Backend persistence test: AES-256-GCM ciphertext decrypts perfectly across independent invocations",
      pass12,
      `Decrypted from DB: ${decryptedOtp}, Original: ${rawOtp12}`
    );
  } catch (err) {
    recordResult(12, "Backend persistence simulation", false, err.message);
  }

  // =========================================================================
  // TEST 13: Order A and Order B have DIFFERENT OTPs (No collisions / shared OTPs)
  // =========================================================================
  try {
    const { order: order13A } = await createTestOrder(custA, partnerA);
    const { order: order13B } = await createTestOrder(custA, partnerA);

    const resA = await axios.get(`${API_BASE}/api/orders/${order13A._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${tokenCustA}` }
    });
    const resB = await axios.get(`${API_BASE}/api/orders/${order13B._id}/delivery-otp`, {
      headers: { Authorization: `Bearer ${tokenCustA}` }
    });

    const pass13 =
      resA.data.otp !== resB.data.otp &&
      resA.data.otp.length === 6 &&
      resB.data.otp.length === 6;

    recordResult(
      13,
      "Order A and Order B receive distinct cryptographically secure OTPs (No collisions)",
      pass13,
      `Order A OTP: ${resA.data.otp} !== Order B OTP: ${resB.data.otp}`
    );
  } catch (err) {
    recordResult(13, "Distinct OTP collision check", false, err.message);
  }

  // =========================================================================
  // TEST 14: Verifying Order A leaves Order B unaffected
  // =========================================================================
  try {
    const { order: order14A, rawOtp: rawOtp14A } = await createTestOrder(custA, partnerA);
    const { order: order14B } = await createTestOrder(custA, partnerA);

    // Verify Order A
    await axios.post(
      `${API_BASE}/api/delivery-partner/orders/${order14A._id}/verify-otp`,
      { otp: rawOtp14A },
      { headers: { Authorization: `Bearer ${tokenDriverA}` } }
    );

    const dbOrderA = await Order.findById(order14A._id);
    const dbOrderB = await Order.findById(order14B._id);

    const pass14 =
      dbOrderA.orderStatus === "Delivered" &&
      dbOrderB.orderStatus !== "Delivered" &&
      dbOrderB.delivery?.otpVerifiedAt === null;

    recordResult(
      14,
      "Verifying Order A leaves Order B completely unaffected and still active",
      pass14,
      `Order A Status: ${dbOrderA.orderStatus}, Order B Status: ${dbOrderB.orderStatus}`
    );
  } catch (err) {
    recordResult(14, "Order isolation verification", false, err.message);
  }

  // =========================================================================
  // TEST 15: Brute Force Protection (5 wrong attempts trigger temporary lockout)
  // =========================================================================
  try {
    const { order: order15, rawOtp: rawOtp15 } = await createTestOrder(custA, partnerA);

    let lockoutEncountered = false;
    let lockoutStatus = 0;
    let lockoutMsg = "";

    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(
          `${API_BASE}/api/delivery-partner/orders/${order15._id}/verify-otp`,
          { otp: "00000" + i },
          { headers: { Authorization: `Bearer ${tokenDriverA}` } }
        );
      } catch (e) {
        if (e.response?.status === 429 || (e.response?.status === 400 && e.response?.data?.message?.includes("locked"))) {
          lockoutEncountered = true;
          lockoutStatus = e.response?.status;
          lockoutMsg = e.response?.data?.message;
        }
      }
    }

    // Now test if even the CORRECT OTP is rejected during the lockout period
    let correctRejectedDuringLockout = false;
    try {
      await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${order15._id}/verify-otp`,
        { otp: rawOtp15 },
        { headers: { Authorization: `Bearer ${tokenDriverA}` } }
      );
    } catch (e) {
      if (e.response?.status === 429 || (e.response?.status === 400 && e.response?.data?.message?.includes("locked"))) {
        correctRejectedDuringLockout = true;
      }
    }

    const checkDb = await Order.findById(order15._id);
    const isLockedInDb = checkDb.delivery?.otpLockedUntil && new Date() < new Date(checkDb.delivery.otpLockedUntil);

    const pass15 = lockoutEncountered && correctRejectedDuringLockout && isLockedInDb;
    recordResult(
      15,
      "Brute force defense: 5 failed attempts trigger temporary lockout (rejecting even correct OTP)",
      pass15,
      `Lockout triggered (Status: ${lockoutStatus}, Msg: "${lockoutMsg}"), Correct OTP during lockout rejected: ${correctRejectedDuringLockout}, DB lockedUntil: ${checkDb.delivery?.otpLockedUntil?.toISOString()}`
    );
  } catch (err) {
    recordResult(15, "Brute force defense test", false, err.message);
  }

  // =========================================================================
  // Final Test Report
  // =========================================================================
  console.log("\n=================================================================");
  console.log("📊 E2E TEST EXECUTION SUMMARY");
  console.log("=================================================================");
  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  testResults.forEach((r) => {
    console.log(`[Test ${r.num.toString().padStart(2, "0")}] ${r.passed ? "✅ PASS" : "❌ FAIL"}: ${r.name}`);
  });

  console.log("=================================================================");
  console.log(`TOTAL: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("=================================================================\n");

  await mongoose.disconnect();
  process.exit(passedCount === totalCount ? 0 : 1);
}

runE2ETests().catch((err) => {
  console.error("Fatal E2E test runner failure:", err);
  process.exit(1);
});
