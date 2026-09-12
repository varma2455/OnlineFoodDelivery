import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "/home/kali2455/Desktop/OnlineFoodDelivery2/Backend/.env" });

const API_BASE = "http://localhost:5000";
const FIREBASE_API_KEY = "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM";
const ADMIN_EMAIL = "yeswanthvaram64280@gmail.com";
const ADMIN_PASSWORD = "684280";

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

async function runAdminVerification() {
    console.log("===============================================================");
    console.log("🔐 COMPREHENSIVE INITIAL ADMIN ACCOUNT VERIFICATION SUITE");
    console.log("===============================================================\n");

    // STEP 1: FIREBASE CLIENT LOGIN FLOW
    console.log("---------------------------------------------------------------");
    console.log("🔥 STEP 1: FIREBASE AUTHENTICATION (CLIENT FLOW SIMULATION)");
    console.log("---------------------------------------------------------------");
    let fbIdToken = null;
    let fbUid = null;
    try {
        const fbRes = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                returnSecureToken: true
            }
        );
        fbIdToken = fbRes.data.idToken;
        fbUid = fbRes.data.localId;
        assert(Boolean(fbIdToken), `Firebase client authentication returned ID Token (length: ${fbIdToken.length})`);
        assert(fbRes.data.email === ADMIN_EMAIL, `Firebase email matches: ${fbRes.data.email}`);
        assert(Boolean(fbUid), `Firebase UID retrieved: ${fbUid}`);
    } catch (err) {
        assert(false, `Firebase authentication failed: ${err.response?.data?.error?.message || err.message}`);
    }

    // STEP 2: BACKEND LOGIN VERIFICATION VIA FIREBASE ID TOKEN
    console.log("\n---------------------------------------------------------------");
    console.log("🛡️ STEP 2: BACKEND LOGIN WITH FIREBASE ID TOKEN");
    console.log("---------------------------------------------------------------");
    let adminBackendToken = null;
    let adminUser = null;
    try {
        const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
            idToken: fbIdToken
        });
        assert(loginRes.data.success === true, "Backend accepted Firebase ID Token");
        assert(loginRes.data.user.role === "admin", `User role is verified as 'admin' (got: ${loginRes.data.user.role})`);
        assert(loginRes.data.user.email === ADMIN_EMAIL, `User email matches: ${loginRes.data.user.email}`);
        adminBackendToken = loginRes.data.token;
        adminUser = loginRes.data.user;
        assert(Boolean(adminBackendToken), "Backend issued JWT token with admin role");
    } catch (err) {
        assert(false, `Backend Firebase ID Token login failed: ${err.response?.data?.message || err.message}`);
    }

    // STEP 3: MONGODB RECORD VERIFICATION
    console.log("\n---------------------------------------------------------------");
    console.log("📦 STEP 3: MONGODB DATABASE RECORD VALIDATION");
    console.log("---------------------------------------------------------------");
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_food_delivery");
        const userInDb = await mongoose.connection.collection("users").findOne({ email: ADMIN_EMAIL });
        
        assert(Boolean(userInDb), `Found user record in MongoDB collection for ${ADMIN_EMAIL}`);
        assert(userInDb.role === "admin", `MongoDB role is 'admin'`);
        assert(userInDb.isVerified === true, `MongoDB isVerified is true`);
        assert(userInDb.isBlocked === false, `MongoDB isBlocked is false`);
        assert(userInDb.firebaseUid === fbUid, `MongoDB firebaseUid matches genuine Firebase UID (${fbUid})`);
        assert(userInDb.password && userInDb.password.startsWith("$2"), "Password is encrypted/hashed with bcrypt (not plaintext)");
        assert(!userInDb.password.includes(ADMIN_PASSWORD), "Plaintext password is not present in the record");
        await mongoose.disconnect();
    } catch (err) {
        assert(false, `MongoDB direct inspection failed: ${err.message}`);
    }

    // STEP 4: ADMIN ACCESS TO ALL ADMIN APIS
    console.log("\n---------------------------------------------------------------");
    console.log("⚡ STEP 4: ADMIN PRIVILEGES & ENDPOINT ACCESS");
    console.log("---------------------------------------------------------------");
    const adminHeaders = { Authorization: `Bearer ${adminBackendToken}` };

    // 4a. Admin Dashboard Telemetry
    try {
        const dashRes = await axios.get(`${API_BASE}/api/admin/dashboard`, { headers: adminHeaders });
        assert(dashRes.data.success === true, `Accessed /api/admin/dashboard (users: ${dashRes.data.stats.users}, orders: ${dashRes.data.stats.orders})`);
    } catch (err) {
        assert(false, `Admin dashboard access failed: ${err.message}`);
    }

    // 4b. Admin User Management
    try {
        const usersRes = await axios.get(`${API_BASE}/api/admin/users`, { headers: adminHeaders });
        assert(usersRes.data.success === true, `Accessed /api/admin/users (${usersRes.data.users.length} users returned)`);
    } catch (err) {
        assert(false, `Admin user management access failed: ${err.message}`);
    }

    // 4c. Admin Food Management
    try {
        const foodsRes = await axios.get(`${API_BASE}/api/foods`, { headers: adminHeaders });
        assert(foodsRes.data.success === true, `Accessed /api/foods (${foodsRes.data.foods.length} items found)`);
    } catch (err) {
        assert(false, `Admin food list access failed: ${err.message}`);
    }

    // 4d. Admin Orders List
    try {
        const ordersRes = await axios.get(`${API_BASE}/api/admin/orders`, { headers: adminHeaders });
        assert(ordersRes.data.success === true, `Accessed /api/admin/orders (${ordersRes.data.orders.length} orders found)`);
    } catch (err) {
        assert(false, `Admin orders list access failed: ${err.message}`);
    }

    // STEP 5: NON-ADMIN ROLE RESTRICTION (403 FORBIDDEN ENFORCEMENT)
    console.log("\n---------------------------------------------------------------");
    console.log("🚫 STEP 5: NON-ADMIN ACCESS DENIAL (CUSTOMER, RESTAURANT, DELIVERY)");
    console.log("---------------------------------------------------------------");

    // 5a. Customer test
    try {
        const custLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "customer@foodexpress.com",
            password: "customerPassword123!"
        });
        const custToken = custLogin.data.token;
        try {
            await axios.get(`${API_BASE}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${custToken}` }
            });
            assert(false, "Customer was NOT blocked from admin API");
        } catch (blockedErr) {
            assert(blockedErr.response?.status === 403, `Customer correctly blocked from /api/admin/dashboard (403 Forbidden)`);
        }
    } catch (err) {
        assert(false, `Customer login for testing failed: ${err.message}`);
    }

    // 5b. Restaurant test
    try {
        const restLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "restaurant@foodexpress.com",
            password: "restaurantPassword123!"
        });
        const restToken = restLogin.data.token;
        try {
            await axios.get(`${API_BASE}/api/admin/users`, {
                headers: { Authorization: `Bearer ${restToken}` }
            });
            assert(false, "Restaurant was NOT blocked from admin API");
        } catch (blockedErr) {
            assert(blockedErr.response?.status === 403, `Restaurant correctly blocked from /api/admin/users (403 Forbidden)`);
        }
    } catch (err) {
        assert(false, `Restaurant login for testing failed: ${err.message}`);
    }

    // 5c. Delivery partner test
    try {
        const delLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "delivery@foodexpress.com",
            password: "deliveryPassword123!"
        });
        const delToken = delLogin.data.token;
        try {
            await axios.get(`${API_BASE}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${delToken}` }
            });
            assert(false, "Delivery partner was NOT blocked from admin API");
        } catch (blockedErr) {
            assert(blockedErr.response?.status === 403, `Delivery partner correctly blocked from /api/admin/dashboard (403 Forbidden)`);
        }
    } catch (err) {
        assert(false, `Delivery login for testing failed: ${err.message}`);
    }

    // STEP 6: PREVENT ADMIN SELF-REGISTRATION TEST
    console.log("\n---------------------------------------------------------------");
    console.log("🛡️ STEP 6: PREVENT ADMIN SELF-REGISTRATION ON PUBLIC ENDPOINTS");
    console.log("---------------------------------------------------------------");
    try {
        const tamperEmail = `hacker_${Date.now()}@example.com`;
        const regRes = await axios.post(`${API_BASE}/api/auth/register`, {
            fullName: "Attacker Trying Admin",
            email: tamperEmail,
            password: "Password@123",
            role: "admin" // malicious client attempt to self-promote
        });
        assert(regRes.data.user.role === "customer", `Tampered registration role forced to 'customer' (got: ${regRes.data.user.role})`);
        
        // Clean up test account
        const delRes = await axios.delete(`${API_BASE}/api/admin/users/${regRes.data.user._id}`, {
            headers: adminHeaders
        });
        assert(delRes.data.success === true, `Admin cleaned up temporary test account`);
    } catch (err) {
        assert(false, `Self-registration security test failed: ${err.message}`);
    }

    console.log("\n===============================================================");
    console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("===============================================================\n");

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runAdminVerification();
