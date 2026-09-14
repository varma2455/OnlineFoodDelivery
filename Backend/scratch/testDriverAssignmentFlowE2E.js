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

const testResults = [];
function recordResult(num, name, passed, details = "") {
    testResults.push({ num, name, passed, details });
    const mark = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`\n${mark} [Test ${num}]: ${name}`);
    if (details) console.log(`   Details: ${details}`);
}

async function runDriverAssignmentE2E() {
    console.log("=================================================================");
    console.log("🚀 STARTING E2E TEST: RESTAURANT → DRIVER ASSIGNMENT & TIMELINE");
    console.log("=================================================================");

    await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_food_delivery"
    );
    console.log("✓ Connected to MongoDB directly for verification");

    // Clean up test records
    await User.deleteMany({
        email: {
            $in: [
                "driver_flow_cust@test.com",
                "driver_flow_ravi@test.com",
                "driver_flow_kiran@test.com",
                "driver_flow_rest_owner@test.com"
            ]
        }
    });
    await DeliveryPartner.deleteMany({
        email: { $in: ["driver_flow_ravi@test.com", "driver_flow_kiran@test.com"] }
    });
    await Restaurant.deleteMany({ email: "driver_flow_rest@test.com" });

    // 1. Create Test Users
    // Customer
    const customerUser = await User.create({
        fullName: "Customer Yeswanth",
        email: "driver_flow_cust@test.com",
        phone: "9876543210",
        role: "customer",
        isVerified: true,
        wallet: 500
    });
    const customerToken = genToken(customerUser._id, "customer");

    // Restaurant Owner & Restaurant
    const restOwner = await User.create({
        fullName: "Restaurant Owner Suprabath",
        email: "driver_flow_rest_owner@test.com",
        phone: "9876543211",
        role: "restaurant",
        isVerified: true
    });
    const restaurantToken = genToken(restOwner._id, "restaurant");

    const restaurant = await Restaurant.create({
        name: "Suprabath Restaurant",
        email: "driver_flow_rest@test.com",
        phone: "9876543212",
        ownerId: restOwner._id,
        address: {
            street: "Main Road, Suprabath Circle",
            city: "Bhimavaram",
            state: "Andhra Pradesh",
            pincode: "534201"
        },
        cuisine: ["Biryani", "South Indian"],
        status: "approved",
        isOpen: true
    });

    // Driver A: Ravi
    const driverAUser = await User.create({
        fullName: "Ravi Teja",
        email: "driver_flow_ravi@test.com",
        phone: "9876543213",
        role: "delivery",
        isVerified: true,
        wallet: 0
    });
    const driverAToken = genToken(driverAUser._id, "delivery");

    const driverAPartner = await DeliveryPartner.create({
        userId: driverAUser._id,
        name: "Ravi Teja",
        email: "driver_flow_ravi@test.com",
        phone: "9876543213",
        vehicleType: "Bike",
        vehicleNumber: "AP37AB1234",
        status: "approved",
        availabilityStatus: "online",
        city: "Bhimavaram",
        completedDeliveries: 5,
        rating: 4.9,
        walletBalance: 0
    });

    // Driver B: Kiran
    const driverBUser = await User.create({
        fullName: "Kiran Kumar",
        email: "driver_flow_kiran@test.com",
        phone: "9876543214",
        role: "delivery",
        isVerified: true,
        wallet: 0
    });
    const driverBToken = genToken(driverBUser._id, "delivery");

    const driverBPartner = await DeliveryPartner.create({
        userId: driverBUser._id,
        name: "Kiran Kumar",
        email: "driver_flow_kiran@test.com",
        phone: "9876543214",
        vehicleType: "Scooter",
        vehicleNumber: "AP37CD5678",
        status: "approved",
        availabilityStatus: "online",
        city: "Bhimavaram",
        completedDeliveries: 3,
        rating: 4.8,
        walletBalance: 0
    });

    console.log("✓ Test users, restaurant, Driver A (Ravi), and Driver B (Kiran) created.");

    // Helper for OTP generation
    const dummyOtp = generateDeliveryOtp();

    // -------------------------------------------------------------
    // STEP 1: Customer places Order A (No driver assigned)
    // -------------------------------------------------------------
    const orderA = await Order.create({
        user: customerUser._id,
        items: [
            {
                food: new mongoose.Types.ObjectId(),
                name: "Special Chicken Biryani",
                image: "biryani.jpg",
                price: 320,
                quantity: 1,
                subtotal: 320,
                restaurantId: restaurant._id
            }
        ],
        totalAmount: 360,
        finalAmount: 360,
        deliveryCharge: 40,
        deliveryEarnings: 60,
        estimatedDeliveryTime: 35,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        orderStatus: "Placed",
        deliveryAddress: {
            fullName: "Customer Yeswanth",
            phone: "9876543210",
            addressLine1: "Door 4-12, Gandhi Nagar",
            city: "Bhimavaram",
            state: "Andhra Pradesh",
            postalCode: "534201"
        },
        deliveryPartner: null,
        deliveryPartnerId: null,
        deliveryStatus: "unassigned",
        delivery: {
            status: "unassigned",
            deliveryPartner: null,
            deliveryPartnerId: null,
            assignedAt: null,
            otpHash: hashDeliveryOtp(dummyOtp, "dummy_id"),
            otpEncrypted: encryptDeliveryOtp(dummyOtp)
        }
    });

    // Update the hash with real orderId
    orderA.delivery.otpHash = hashDeliveryOtp(dummyOtp, orderA._id.toString());
    await orderA.save();

    recordResult(
        1,
        "Order Placed - Unassigned driver state",
        orderA.deliveryStatus === "unassigned" && orderA.deliveryPartner === null,
        `Order #${orderA._id} created with orderStatus=Placed, deliveryStatus=unassigned, deliveryPartner=null`
    );

    // -------------------------------------------------------------
    // STEP 2 & 3: Restaurant confirms and starts cooking
    // -------------------------------------------------------------
    const confRes = await axios.put(
        `${API_BASE}/api/restaurant/orders/${orderA._id}/status`,
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );
    const prepRes = await axios.put(
        `${API_BASE}/api/restaurant/orders/${orderA._id}/status`,
        { status: "Preparing" },
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );

    const docAfterPrep = await Order.findById(orderA._id);
    recordResult(
        2,
        "Restaurant progression: Confirmed -> Preparing (Driver still unassigned)",
        confRes.data.success && prepRes.data.success && docAfterPrep.deliveryPartner === null,
        `orderStatus=${docAfterPrep.orderStatus}, deliveryPartner=${docAfterPrep.deliveryPartner}`
    );

    // -------------------------------------------------------------
    // STEP 4: Restaurant marks Ready for Pickup
    // -------------------------------------------------------------
    const readyRes = await axios.put(
        `${API_BASE}/api/restaurant/orders/${orderA._id}/status`,
        { status: "Ready for Pickup" },
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );

    const docAfterReady = await Order.findById(orderA._id);
    recordResult(
        3,
        "Restaurant marks Ready for Pickup (Preserves OTP & Ready for driver assignment)",
        readyRes.data.success && docAfterReady.orderStatus === "Ready for Pickup" && Boolean(docAfterReady.delivery.otpHash),
        `orderStatus=${docAfterReady.orderStatus}, otpHash preserved=${Boolean(docAfterReady.delivery.otpHash)}`
    );

    // -------------------------------------------------------------
    // STEP 5: Restaurant fetches available online delivery partners
    // -------------------------------------------------------------
    const availablePartnersRes = await axios.get(
        `${API_BASE}/api/restaurant/delivery-partners/available`,
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );

    const partnerList = availablePartnersRes.data.deliveryPartners || [];
    const hasRavi = partnerList.some((p) => p._id.toString() === driverAPartner._id.toString());
    const hasKiran = partnerList.some((p) => p._id.toString() === driverBPartner._id.toString());

    recordResult(
        4,
        "Restaurant queries eligible online delivery partners",
        availablePartnersRes.data.success && hasRavi && hasKiran,
        `Found ${partnerList.length} online drivers: Ravi found=${hasRavi}, Kiran found=${hasKiran}`
    );

    // -------------------------------------------------------------
    // STEP 6 & 7: Restaurant assigns Order A to Driver A (Ravi)
    // -------------------------------------------------------------
    const assignRes = await axios.put(
        `${API_BASE}/api/restaurant/orders/${orderA._id}/assign-delivery`,
        { deliveryPartnerId: driverAPartner._id.toString() },
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );

    const docAfterAssign = await Order.findById(orderA._id);
    const isSavedRavi =
        docAfterAssign.deliveryPartner?.toString() === driverAPartner._id.toString() &&
        docAfterAssign.deliveryPartnerId?.toString() === driverAPartner._id.toString() &&
        docAfterAssign.deliveryStatus === "Assigned" &&
        docAfterAssign.delivery?.status === "Assigned" &&
        docAfterAssign.delivery?.deliveryPartner?.toString() === driverAPartner._id.toString();

    recordResult(
        5,
        "Restaurant assigns Driver A (Ravi) -> MongoDB fields synchronized",
        assignRes.data.success && isSavedRavi,
        `Order deliveryPartner=${docAfterAssign.deliveryPartner}, deliveryStatus=${docAfterAssign.deliveryStatus}, delivery.status=${docAfterAssign.delivery.status}`
    );

    // -------------------------------------------------------------
    // STEP 8: Driver A checks /api/delivery-partner/dashboard
    // -------------------------------------------------------------
    const driverADash = await axios.get(`${API_BASE}/api/delivery-partner/dashboard`, {
        headers: { Authorization: `Bearer ${driverAToken}` }
    });

    const driverAAssignedList = driverADash.data.assignedOrders || [];
    const driverASeesOrderA = driverAAssignedList.some((o) => o._id.toString() === orderA._id.toString());
    const driverAStatAssigned = driverADash.data.stats?.assignedDeliveries >= 1;

    recordResult(
        6,
        "Driver A (Ravi) sees Order A in Dashboard assignedOrders & stats.assignedDeliveries",
        driverASeesOrderA && driverAStatAssigned,
        `Driver A assignedOrders count=${driverAAssignedList.length}, stats.assignedDeliveries=${driverADash.data.stats?.assignedDeliveries}`
    );

    // -------------------------------------------------------------
    // STEP 9: Driver B (Kiran) checks Dashboard -> STRICT ISOLATION
    // -------------------------------------------------------------
    const driverBDash = await axios.get(`${API_BASE}/api/delivery-partner/dashboard`, {
        headers: { Authorization: `Bearer ${driverBToken}` }
    });

    const driverBAssignedList = driverBDash.data.assignedOrders || [];
    const driverBSeesOrderA = driverBAssignedList.some((o) => o._id.toString() === orderA._id.toString());
    const driverBStatAssigned = driverBDash.data.stats?.assignedDeliveries === 0;

    recordResult(
        7,
        "Driver B (Kiran) MUST NOT see Driver A's assigned order (Strict Driver Isolation)",
        !driverBSeesOrderA && driverBAssignedList.length === 0 && driverBStatAssigned,
        `Driver B assignedOrders count=${driverBAssignedList.length}, sees Driver A order=${driverBSeesOrderA}`
    );

    // -------------------------------------------------------------
    // STEP 10 & 11: Check GET /api/delivery-partner/orders for Driver A vs Driver B
    // -------------------------------------------------------------
    const driverAOrdersRes = await axios.get(`${API_BASE}/api/delivery-partner/orders`, {
        headers: { Authorization: `Bearer ${driverAToken}` }
    });
    const driverBOrdersRes = await axios.get(`${API_BASE}/api/delivery-partner/orders`, {
        headers: { Authorization: `Bearer ${driverBToken}` }
    });

    const driverAHasInOrders = (driverAOrdersRes.data.assignedOrders || []).some(
        (o) => o._id.toString() === orderA._id.toString()
    );
    const driverBHasInOrders = (driverBOrdersRes.data.assignedOrders || []).some(
        (o) => o._id.toString() === orderA._id.toString()
    );

    recordResult(
        8,
        "Driver Orders Feed: Driver A sees assigned order, Driver B sees 0 assigned orders",
        driverAHasInOrders && !driverBHasInOrders,
        `Driver A assignedCount=${driverAOrdersRes.data.assignedCount}, Driver B assignedCount=${driverBOrdersRes.data.assignedCount}`
    );

    // -------------------------------------------------------------
    // STEP 12: Driver A accepts Order A
    // -------------------------------------------------------------
    const acceptRes = await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );

    const docAfterAccept = await Order.findById(orderA._id);
    const isAccepted = docAfterAccept.deliveryStatus === "Accepted" && docAfterAccept.delivery.status === "Accepted";

    // Dashboard check: Order A is now activeDelivery
    const dashAfterAccept = await axios.get(`${API_BASE}/api/delivery-partner/dashboard`, {
        headers: { Authorization: `Bearer ${driverAToken}` }
    });
    const isActiveDeliveryNow = dashAfterAccept.data.activeDelivery?._id.toString() === orderA._id.toString();

    recordResult(
        9,
        "Driver A accepts Order -> deliveryStatus=Accepted & moves to activeDelivery",
        acceptRes.data.success && isAccepted && isActiveDeliveryNow,
        `deliveryStatus=${docAfterAccept.deliveryStatus}, activeDelivery in dashboard=${isActiveDeliveryNow}`
    );

    // -------------------------------------------------------------
    // STEP 13: Delivery Status Transitions:
    // Accepted -> Going to Restaurant -> Arrived at Restaurant -> Order Picked Up -> Going to Customer -> Arrived at Customer
    // -------------------------------------------------------------
    await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/status`,
        { deliveryStatus: "Going to Restaurant" },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );
    await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/status`,
        { deliveryStatus: "Arrived at Restaurant" },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );
    await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/status`,
        { deliveryStatus: "Order Picked Up" },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );

    const docAfterPickup = await Order.findById(orderA._id);
    const isOutForDelivery = docAfterPickup.orderStatus === "Out for Delivery" && docAfterPickup.deliveryStatus === "Order Picked Up";

    await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/status`,
        { deliveryStatus: "Going to Customer" },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );
    await axios.put(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/status`,
        { deliveryStatus: "Arrived at Customer" },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );

    const docAfterArrive = await Order.findById(orderA._id);
    const isArrived = docAfterArrive.deliveryStatus === "Arrived at Customer";

    recordResult(
        10,
        "Driver status flow progression to 'Arrived at Customer'",
        isOutForDelivery && isArrived,
        `Order Picked Up orderStatus=${docAfterPickup.orderStatus}, Arrived at Customer deliveryStatus=${docAfterArrive.deliveryStatus}`
    );

    // -------------------------------------------------------------
    // STEP 14: Customer fetches Order details -> sees Driver Name & Delivery OTP
    // -------------------------------------------------------------
    const custOrderRes = await axios.get(`${API_BASE}/api/orders/${orderA._id}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
    });

    const custOrderData = custOrderRes.data.order || custOrderRes.data.data;
    const custDriverName = custOrderData.deliveryPartner?.name || custOrderData.delivery?.deliveryPartner?.name;
    const custOtp = custOrderData.deliveryOtp;

    recordResult(
        11,
        "Customer Order API returns assigned driver name & decrypted delivery OTP",
        custDriverName === "Ravi Teja" && custOtp === dummyOtp,
        `Returned driver=${custDriverName}, OTP received=${custOtp} (matches dummyOtp: ${custOtp === dummyOtp})`
    );

    // -------------------------------------------------------------
    // STEP 15: Driver OTP verification (Invalid OTP rejected)
    // -------------------------------------------------------------
    let invalidOtpRejected = false;
    try {
        await axios.post(
            `${API_BASE}/api/delivery-partner/orders/${orderA._id}/verify-otp`,
            { otp: "000000" },
            { headers: { Authorization: `Bearer ${driverAToken}` } }
        );
    } catch (err) {
        if (err.response?.status === 400) {
            invalidOtpRejected = true;
        }
    }

    recordResult(
        12,
        "Invalid OTP verification rejected by backend with 400",
        invalidOtpRejected,
        "Driver entered '000000' and request was rejected."
    );

    // -------------------------------------------------------------
    // STEP 16: Driver enters CORRECT OTP -> Order Delivered & Earnings Credited
    // -------------------------------------------------------------
    const verifyRes = await axios.post(
        `${API_BASE}/api/delivery-partner/orders/${orderA._id}/verify-otp`,
        { otp: dummyOtp },
        { headers: { Authorization: `Bearer ${driverAToken}` } }
    );

    const docAfterDelivered = await Order.findById(orderA._id);
    const isFullyDelivered =
        docAfterDelivered.orderStatus === "Delivered" &&
        docAfterDelivered.deliveryStatus === "Delivered" &&
        Boolean(docAfterDelivered.deliveredAt);

    // Check Driver Wallet balance
    const updatedPartner = await DeliveryPartner.findById(driverAPartner._id);
    const isCredited = updatedPartner.walletBalance === 60;

    recordResult(
        13,
        "Correct OTP verifies -> Order marked Delivered & ₹60 earnings credited to Driver A",
        verifyRes.data.success && isFullyDelivered && isCredited,
        `orderStatus=${docAfterDelivered.orderStatus}, deliveryStatus=${docAfterDelivered.deliveryStatus}, driver walletBalance=₹${updatedPartner.walletBalance}`
    );

    // -------------------------------------------------------------
    // STEP 17: MULTI-ORDER TEST: Order B assigned to Driver B (Kiran)
    // -------------------------------------------------------------
    const orderB = await Order.create({
        user: customerUser._id,
        items: [
            {
                food: new mongoose.Types.ObjectId(),
                name: "Paneer Butter Masala",
                image: "paneer.jpg",
                price: 240,
                quantity: 1,
                subtotal: 240,
                restaurantId: restaurant._id
            }
        ],
        totalAmount: 280,
        finalAmount: 280,
        deliveryEarnings: 50,
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        orderStatus: "Ready for Pickup",
        deliveryAddress: {
            fullName: "Customer Yeswanth",
            phone: "9876543210",
            addressLine1: "Door 8-9, Subhash Nagar",
            city: "Bhimavaram",
            state: "Andhra Pradesh",
            postalCode: "534201"
        },
        deliveryPartner: null,
        deliveryPartnerId: null,
        deliveryStatus: "unassigned",
        delivery: {
            status: "unassigned"
        }
    });

    // Restaurant assigns Order B to Driver B (Kiran)
    await axios.put(
        `${API_BASE}/api/restaurant/orders/${orderB._id}/assign-delivery`,
        { deliveryPartnerId: driverBPartner._id.toString() },
        { headers: { Authorization: `Bearer ${restaurantToken}` } }
    );

    // Query Driver A dashboard and Driver B dashboard
    const [finalDashA, finalDashB] = await Promise.all([
        axios.get(`${API_BASE}/api/delivery-partner/dashboard`, {
            headers: { Authorization: `Bearer ${driverAToken}` }
        }),
        axios.get(`${API_BASE}/api/delivery-partner/dashboard`, {
            headers: { Authorization: `Bearer ${driverBToken}` }
        })
    ]);

    const finalAssignedA = finalDashA.data.assignedOrders || [];
    const finalAssignedB = finalDashB.data.assignedOrders || [];

    const driverASeesOrderB = finalAssignedA.some((o) => o._id.toString() === orderB._id.toString());
    const driverBSeesOrderB = finalAssignedB.some((o) => o._id.toString() === orderB._id.toString());

    recordResult(
        14,
        "Multi-Driver Test: Driver B sees Order B, Driver A NEVER sees Order B",
        !driverASeesOrderB && driverBSeesOrderB,
        `Driver B sees Order B=${driverBSeesOrderB}, Driver A sees Order B=${driverASeesOrderB}`
    );

    // -------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------
    await Order.deleteMany({ _id: { $in: [orderA._id, orderB._id] } });
    await User.deleteMany({
        email: {
            $in: [
                "driver_flow_cust@test.com",
                "driver_flow_ravi@test.com",
                "driver_flow_kiran@test.com",
                "driver_flow_rest_owner@test.com"
            ]
        }
    });
    await DeliveryPartner.deleteMany({
        email: { $in: ["driver_flow_ravi@test.com", "driver_flow_kiran@test.com"] }
    });
    await Restaurant.deleteMany({ email: "driver_flow_rest@test.com" });

    console.log("\n=================================================================");
    console.log("📊 E2E TEST SUMMARY");
    console.log("=================================================================");
    const passedCount = testResults.filter((r) => r.passed).length;
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${testResults.length - passedCount}`);

    testResults.forEach((r) => {
        console.log(`${r.passed ? "✓" : "✗"} Test ${r.num}: ${r.name}`);
    });

    if (passedCount === testResults.length) {
        console.log("\n🎉 ALL 14 DRIVER ASSIGNMENT & TIMELINE TESTS PASSED PERFECTLY!");
    } else {
        console.error("\n❌ SOME TESTS FAILED!");
        process.exit(1);
    }

    await mongoose.disconnect();
    process.exit(0);
}

runDriverAssignmentE2E().catch((err) => {
    console.error("FATAL ERROR IN E2E SUITE:", err);
    process.exit(1);
});
