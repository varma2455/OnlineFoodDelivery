import dotenv from "dotenv";
import axios from "axios";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { adminAuth, setCustomClaims } from "../config/firebaseAdmin.js";

dotenv.config();

const FIREBASE_API_KEY =
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM";

/**
 * Obtain or create Firebase user and retrieve the genuine Firebase UID.
 */
async function syncFirebaseUser(email, password) {
    let firebaseUid = null;

    // Method 1: Use Firebase Admin SDK if configured
    if (adminAuth) {
        try {
            const userRecord = await adminAuth.getUserByEmail(email);
            firebaseUid = userRecord.uid;
            console.log(`ℹ️ [Firebase Admin] User found in Firebase Auth: ${email} (UID: ${firebaseUid})`);

            // Update user properties if needed
            await adminAuth.updateUser(firebaseUid, {
                emailVerified: true
            });

            // Set admin custom claims
            await setCustomClaims(firebaseUid, { role: "admin", admin: true });
            return firebaseUid;
        } catch (err) {
            if (err.code === "auth/user-not-found") {
                try {
                    const newUser = await adminAuth.createUser({
                        email,
                        password,
                        emailVerified: true,
                        displayName: "Administrator"
                    });
                    firebaseUid = newUser.uid;
                    console.log(`✅ [Firebase Admin] Created new Firebase user: ${email} (UID: ${firebaseUid})`);
                    await setCustomClaims(firebaseUid, { role: "admin", admin: true });
                    return firebaseUid;
                } catch (createErr) {
                    console.warn("⚠️ [Firebase Admin] Failed to create user via Admin SDK:", createErr.message);
                }
            } else {
                console.warn("⚠️ [Firebase Admin] getUserByEmail note:", err.message);
            }
        }
    }

    // Method 2: Use Firebase Identity Toolkit REST API (Backend only)
    if (!firebaseUid) {
        try {
            // Attempt sign-in with password first
            const signInRes = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
                {
                    email,
                    password,
                    returnSecureToken: true
                }
            );
            firebaseUid = signInRes.data.localId;
            console.log(`ℹ️ [Firebase REST] Authenticated user in Firebase Auth: ${email} (UID: ${firebaseUid})`);
            return firebaseUid;
        } catch (signInErr) {
            const errCode = signInErr.response?.data?.error?.message;
            console.log(`ℹ️ [Firebase REST] Sign-in response: ${errCode || signInErr.message}`);

            if (errCode === "EMAIL_NOT_FOUND" || errCode === "INVALID_LOGIN_CREDENTIALS") {
                try {
                    // Attempt sign-up
                    const signUpRes = await axios.post(
                        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
                        {
                            email,
                            password,
                            returnSecureToken: true
                        }
                    );
                    firebaseUid = signUpRes.data.localId;
                    console.log(`✅ [Firebase REST] Created user in Firebase Auth: ${email} (UID: ${firebaseUid})`);
                    return firebaseUid;
                } catch (signUpErr) {
                    const upErrCode = signUpErr.response?.data?.error?.message;
                    if (upErrCode === "EMAIL_EXISTS") {
                        console.log(`ℹ️ [Firebase REST] User already exists in Firebase Auth.`);
                    } else {
                        console.warn("⚠️ [Firebase REST] Sign up error:", upErrCode || signUpErr.message);
                    }
                }
            }
        }
    }

    return firebaseUid;
}

/**
 * Idempotent Admin Provisioning Logic
 */
export async function provisionAdminAccount(options = {}) {
    const email = (options.email || process.env.ADMIN_EMAIL || "yeswanthvaram64280@gmail.com").toLowerCase().trim();
    const password = options.password || process.env.ADMIN_PASSWORD || "684280";

    if (!email || !password) {
        throw new Error("Admin email and password must be configured in environment or passed to provisioner.");
    }

    console.log(`\n===============================================================`);
    console.log(`🔐 INITIALIZING IDEMPOTENT ADMIN PROVISIONING FOR: ${email}`);
    console.log(`===============================================================`);

    // 1. Synchronize Firebase Authentication User
    const firebaseUid = await syncFirebaseUser(email, password);

    // 2. Synchronize MongoDB User Record
    const query = firebaseUid
        ? { $or: [{ email }, { firebaseUid }] }
        : { email };

    let mongoUser = await User.findOne(query).select("+password");

    if (mongoUser) {
        let modified = false;

        if (mongoUser.role !== "admin") {
            mongoUser.role = "admin";
            modified = true;
        }
        if (firebaseUid && mongoUser.firebaseUid !== firebaseUid) {
            mongoUser.firebaseUid = firebaseUid;
            modified = true;
        }
        if (!mongoUser.isVerified) {
            mongoUser.isVerified = true;
            modified = true;
        }
        if (mongoUser.isBlocked) {
            mongoUser.isBlocked = false;
            modified = true;
        }

        // Update password if specified
        if (password) {
            mongoUser.password = password; // userSchema.pre("save") hashes it
            modified = true;
        }

        if (modified) {
            await mongoUser.save();
            console.log(`✅ [MongoDB] Existing user record updated to 'admin' role.`);
        } else {
            console.log(`ℹ️ [MongoDB] Admin user record already up-to-date.`);
        }
    } else {
        mongoUser = await User.create({
            fullName: "Administrator",
            email,
            password, // userSchema.pre("save") hashes with bcrypt
            role: "admin",
            firebaseUid: firebaseUid || undefined,
            isVerified: true,
            isBlocked: false,
            phone: "9999999999",
            wallet: 1000,
            rewardPoints: 500
        });
        console.log(`✅ [MongoDB] New administrator record provisioned.`);
    }

    // Sanitize user summary for logging (NEVER expose password)
    const summary = {
        id: mongoUser._id,
        email: mongoUser.email,
        role: mongoUser.role,
        firebaseUid: mongoUser.firebaseUid,
        isVerified: mongoUser.isVerified,
        isBlocked: mongoUser.isBlocked
    };

    console.log(`\n🎉 PROVISIONING SUCCESSFUL:`);
    console.log(JSON.stringify(summary, null, 2));
    console.log(`===============================================================\n`);

    return summary;
}

/**
 * Provision all configured and designated administrators idempotently.
 */
export async function provisionAllAdmins() {
    const adminsToProvision = [
        { email: "yeswanthvaram64280@gmail.com", password: "684280", fullName: "Super Admin" },
        { email: "pothuri2455@gmail.com", password: "684280", fullName: "Admin Pothuri" }
    ];

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const envEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
        const existing = adminsToProvision.find((a) => a.email === envEmail);
        if (existing) {
            existing.password = process.env.ADMIN_PASSWORD;
        } else {
            adminsToProvision.push({
                email: envEmail,
                password: process.env.ADMIN_PASSWORD,
                fullName: "Administrator"
            });
        }
    }

    const results = [];
    for (const adminConfig of adminsToProvision) {
        const res = await provisionAdminAccount(adminConfig);
        results.push(res);
    }
    return results;
}

// Allow CLI execution: node seed/adminSeeder.js
if (process.argv[1] && process.argv[1].endsWith("adminSeeder.js")) {
    (async () => {
        try {
            await connectDB();
            await provisionAllAdmins();
            process.exit(0);
        } catch (err) {
            console.error("❌ Admin provisioning failed:", err);
            process.exit(1);
        }
    })();
}
