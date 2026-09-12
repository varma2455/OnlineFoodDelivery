import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "/home/kali2455/Desktop/OnlineFoodDelivery2/Backend/.env" });

const API_BASE = "http://localhost:5000";
const FIREBASE_API_KEY = "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM";

const ADMIN_1_EMAIL = "yeswanthvaram64280@gmail.com";
const ADMIN_1_PASSWORD = "684280";

const ADMIN_2_EMAIL = "pothuri2455@gmail.com";
const ADMIN_2_PASSWORD = "684280";

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

async function runDualAdminVerification() {
    console.log("===============================================================");
    console.log("🔐 COMPREHENSIVE SECOND ADMIN (pothuri2455@gmail.com) & DUAL ADMIN SUITE");
    console.log("===============================================================\n");

    // -------------------------------------------------------------
    // PART 1: NEW ADMIN (pothuri2455@gmail.com) VERIFICATION
    // -------------------------------------------------------------
    console.log("---------------------------------------------------------------");
    console.log("🔥 TEST 1: FIREBASE AUTHENTICATION FOR pothuri2455@gmail.com");
    console.log("---------------------------------------------------------------");
    let admin2FbToken = null;
    let admin2FbUid = null;
    try {
        const fbRes = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                email: ADMIN_2_EMAIL,
                password: ADMIN_2_PASSWORD,
                returnSecureToken: true
            }
        );
        admin2FbToken = fbRes.data.idToken;
        admin2FbUid = fbRes.data.localId;
        assert(Boolean(admin2FbToken), `Firebase returned ID token for pothuri2455 (length: ${admin2FbToken.length})`);
        assert(fbRes.data.email === ADMIN_2_EMAIL, `Firebase email matches: ${fbRes.data.email}`);
        assert(Boolean(admin2FbUid), `Firebase UID retrieved: ${admin2FbUid}`);
    } catch (err) {
        assert(false, `Firebase authentication failed for pothuri2455: ${err.response?.data?.error?.message || err.message}`);
    }

    console.log("\n---------------------------------------------------------------");
    console.log("🛡️ TEST 2: BACKEND LOGIN WITH FIREBASE ID TOKEN FOR pothuri2455");
    console.log("---------------------------------------------------------------");
    let admin2BackendToken = null;
    let admin2User = null;
    try {
        const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
            idToken: admin2FbToken
        });
        assert(loginRes.data.success === true, "Backend accepted Firebase ID Token for pothuri2455");
        assert(loginRes.data.user.role === "admin", `User role is verified as 'admin' (got: ${loginRes.data.user.role})`);
        assert(loginRes.data.user.email === ADMIN_2_EMAIL, `User email matches: ${loginRes.data.user.email}`);
        admin2BackendToken = loginRes.data.token;
        admin2User = loginRes.data.user;
        assert(Boolean(admin2BackendToken), "Backend issued JWT with role: admin");
    } catch (err) {
        assert(false, `Backend login failed for pothuri2455: ${err.response?.data?.message || err.message}`);
    }

    console.log("\n---------------------------------------------------------------");
    console.log("📦 TEST 3: MONGODB DATABASE VALIDATION FOR pothuri2455");
    console.log("---------------------------------------------------------------");
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_food_delivery");
        const userInDb = await mongoose.connection.collection("users").findOne({ email: ADMIN_2_EMAIL });
        
        assert(Boolean(userInDb), `Found user record in MongoDB for ${ADMIN_2_EMAIL}`);
        assert(userInDb.role === "admin", `MongoDB role is strictly 'admin'`);
        assert(userInDb.isVerified === true, `MongoDB isVerified is true`);
        assert(userInDb.isBlocked === false, `MongoDB isBlocked is false`);
        assert(userInDb.firebaseUid === admin2FbUid, `MongoDB firebaseUid matches actual Firebase UID (${admin2FbUid})`);
        assert(userInDb.password && userInDb.password.startsWith("$2"), "Password encrypted with bcrypt (not plaintext)");
        assert(!userInDb.password.includes(ADMIN_2_PASSWORD), "Plaintext password is not present in record");
    } catch (err) {
        assert(false, `MongoDB direct check failed: ${err.message}`);
    }

    console.log("\n---------------------------------------------------------------");
    console.log("⚡ TEST 4: ADMIN PRIVILEGES FOR pothuri2455");
    console.log("---------------------------------------------------------------");
    const admin2Headers = { Authorization: `Bearer ${admin2BackendToken}` };

    try {
        const dashRes = await axios.get(`${API_BASE}/api/admin/dashboard`, { headers: admin2Headers });
        assert(dashRes.data.success === true, `Accessed /api/admin/dashboard (users: ${dashRes.data.stats.users})`);
    } catch (err) {
        assert(false, `Admin dashboard access failed: ${err.message}`);
    }

    try {
        const usersRes = await axios.get(`${API_BASE}/api/admin/users`, { headers: admin2Headers });
        assert(usersRes.data.success === true, `Accessed /api/admin/users (${usersRes.data.users.length} users found)`);
    } catch (err) {
        assert(false, `Admin user management access failed: ${err.message}`);
    }

    try {
        const foodsRes = await axios.get(`${API_BASE}/api/foods`, { headers: admin2Headers });
        assert(foodsRes.data.success === true, `Accessed /api/foods (${foodsRes.data.foods.length} items found)`);
    } catch (err) {
        assert(false, `Food list access failed: ${err.message}`);
    }

    try {
        const ordersRes = await axios.get(`${API_BASE}/api/admin/orders`, { headers: admin2Headers });
        assert(ordersRes.data.success === true, `Accessed /api/admin/orders (${ordersRes.data.orders.length} orders found)`);
    } catch (err) {
        assert(false, `Orders list access failed: ${err.message}`);
    }

    // -------------------------------------------------------------
    // PART 2: EXISTING ADMIN (yeswanthvaram64280@gmail.com) VERIFICATION
    // -------------------------------------------------------------
    console.log("\n---------------------------------------------------------------");
    console.log("👑 TEST 5: EXISTING ADMIN (yeswanthvaram64280@gmail.com) PRESERVATION");
    console.log("---------------------------------------------------------------");
    try {
        const admin1FbRes = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
                email: ADMIN_1_EMAIL,
                password: ADMIN_1_PASSWORD,
                returnSecureToken: true
            }
        );
        assert(Boolean(admin1FbRes.data.idToken), "Existing admin Firebase login remains active");

        const admin1Login = await axios.post(`${API_BASE}/api/auth/login`, {
            idToken: admin1FbRes.data.idToken
        });
        assert(admin1Login.data.success === true, "Existing admin backend login succeeded");
        assert(admin1Login.data.user.role === "admin", `Existing admin role remains 'admin' (got: ${admin1Login.data.user.role})`);

        const admin1Headers = { Authorization: `Bearer ${admin1Login.data.token}` };
        const admin1Dash = await axios.get(`${API_BASE}/api/admin/dashboard`, { headers: admin1Headers });
        assert(admin1Dash.data.success === true, "Existing admin can access /api/admin/dashboard");
    } catch (err) {
        assert(false, `Existing admin preservation failed: ${err.message}`);
    }

    // -------------------------------------------------------------
    // PART 3: NON-ADMIN ACCESS DENIAL (403 FORBIDDEN)
    // -------------------------------------------------------------
    console.log("\n---------------------------------------------------------------");
    console.log("🚫 TEST 6: NON-ADMIN ACCESS DENIAL TO ADMIN ENDPOINTS");
    console.log("---------------------------------------------------------------");
    // Customer
    try {
        const custLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "customer@foodexpress.com",
            password: "customerPassword123!"
        });
        await axios.get(`${API_BASE}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${custLogin.data.token}` }
        });
        assert(false, "Customer was NOT blocked from /api/admin/dashboard");
    } catch (e) {
        assert(e.response?.status === 403, `Customer access blocked with HTTP 403 Forbidden`);
    }

    // Restaurant
    try {
        const restLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "restaurant@foodexpress.com",
            password: "restaurantPassword123!"
        });
        await axios.get(`${API_BASE}/api/admin/users`, {
            headers: { Authorization: `Bearer ${restLogin.data.token}` }
        });
        assert(false, "Restaurant was NOT blocked from /api/admin/users");
    } catch (e) {
        assert(e.response?.status === 403, `Restaurant access blocked with HTTP 403 Forbidden`);
    }

    // Delivery
    try {
        const delLogin = await axios.post(`${API_BASE}/api/auth/login`, {
            email: "delivery@foodexpress.com",
            password: "deliveryPassword123!"
        });
        await axios.get(`${API_BASE}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${delLogin.data.token}` }
        });
        assert(false, "Delivery was NOT blocked from /api/admin/dashboard");
    } catch (e) {
        assert(e.response?.status === 403, `Delivery partner access blocked with HTTP 403 Forbidden`);
    }

    await mongoose.disconnect();

    console.log("\n===============================================================");
    console.log(`🏁 DUAL ADMIN VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("===============================================================\n");

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runDualAdminVerification();
