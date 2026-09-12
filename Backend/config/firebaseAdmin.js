import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app = null;
let adminAuth = null;

if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        };

        app = initializeApp({
            credential: cert(serviceAccount)
        });

        adminAuth = getAuth(app);
        console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (err) {
        console.warn("⚠️ Firebase Admin initialization failed:", err.message);
    }
} else {
    console.log("ℹ️ Firebase Admin credentials not provided in environment; fallback auth mode enabled.");
}

/**
 * Verify a Firebase ID Token using Firebase Admin SDK
 */
export const verifyFirebaseToken = async (idToken) => {
    if (!idToken) return null;

    if (adminAuth) {
        try {
            const decoded = await adminAuth.verifyIdToken(idToken);
            return {
                uid: decoded.uid,
                email: decoded.email || null,
                phone_number: decoded.phone_number || null,
                sign_in_provider: decoded.firebase?.sign_in_provider || null,
                name: decoded.name || (decoded.email ? decoded.email.split("@")[0] : "User"),
                email_verified: Boolean(decoded.email_verified),
                picture: decoded.picture || null,
                isFirebase: true
            };
        } catch (err) {
            console.warn("Firebase Admin verifyIdToken error:", err.message);
            return null;
        }
    }

    // Fallback: decode JWT payload if Firebase Admin is not configured
    try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
            if (payload.user_id || payload.sub) {
                return {
                    uid: payload.user_id || payload.sub,
                    email: payload.email || null,
                    phone_number: payload.phone_number || null,
                    sign_in_provider: payload.firebase?.sign_in_provider || null,
                    name: payload.name || (payload.email ? payload.email.split("@")[0] : "User"),
                    email_verified: Boolean(payload.email_verified),
                    picture: payload.picture || null,
                    isFirebase: true
                };
            }
        }
    } catch (decodeErr) {
        // Not a decodable token
    }

    return null;
};

/**
 * List Firebase Users (Admin Only)
 */
export const listFirebaseUsers = async (maxResults = 100) => {
    if (!adminAuth) return [];
    try {
        const listResult = await adminAuth.listUsers(maxResults);
        return listResult.users.map((u) => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || "",
            disabled: u.disabled,
            emailVerified: u.emailVerified,
            customClaims: u.customClaims || {},
            metadata: {
                creationTime: u.metadata?.creationTime,
                lastSignInTime: u.metadata?.lastSignInTime
            },
            providerData: u.providerData || []
        }));
    } catch (err) {
        console.warn("Firebase listUsers error:", err.message);
        return [];
    }
};

/**
 * Update user in Firebase Auth (Admin Only)
 */
export const updateFirebaseUser = async (uid, properties) => {
    if (!adminAuth || !uid) return null;
    try {
        return await adminAuth.updateUser(uid, properties);
    } catch (err) {
        console.warn(`Firebase updateUser error for ${uid}:`, err.message);
        return null;
    }
};

/**
 * Set custom user claims for role-based authorization (Admin Only)
 */
export const setCustomClaims = async (uid, claims) => {
    if (!adminAuth || !uid) return null;
    try {
        await adminAuth.setCustomUserClaims(uid, claims);
        return true;
    } catch (err) {
        console.warn(`Firebase setCustomClaims error for ${uid}:`, err.message);
        return false;
    }
};

/**
 * Delete a user from Firebase Auth (Admin Only)
 */
export const deleteFirebaseUser = async (uid) => {
    if (!adminAuth || !uid) return null;
    try {
        await adminAuth.deleteUser(uid);
        return true;
    } catch (err) {
        console.warn(`Firebase deleteUser error for ${uid}:`, err.message);
        return false;
    }
};

export { adminAuth };
export default app;