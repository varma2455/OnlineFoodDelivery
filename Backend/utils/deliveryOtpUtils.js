import crypto from "crypto";

// Strong server-side secret key for OTP hashing & encryption
const OTP_SECRET =
    process.env.OTP_SECRET ||
    process.env.JWT_SECRET ||
    "foodexpress_secure_delivery_otp_handover_secret_key_2025";

// Derive 32-byte encryption key for AES-256-GCM
const ENCRYPTION_KEY = crypto.createHash("sha256").update(OTP_SECRET).digest();

/**
 * Generate a cryptographically secure random 6-digit OTP
 * Never generates fixed patterns like 000000 or 123456
 */
export const generateDeliveryOtp = () => {
    const forbidden = [
        "000000",
        "111111",
        "222222",
        "333333",
        "444444",
        "555555",
        "666666",
        "777777",
        "888888",
        "999999",
        "123456",
        "654321"
    ];

    let otp = "";
    let attempts = 0;

    do {
        // Generates integer in range [100000, 999999]
        otp = crypto.randomInt(100000, 1000000).toString();
        attempts++;
    } while (forbidden.includes(otp) && attempts < 10);

    return otp;
};

/**
 * Compute cryptographic HMAC-SHA256 hash of OTP
 * Salted with orderId to ensure hash uniqueness per order
 */
export const hashDeliveryOtp = (otp, orderId = "") => {
    if (!otp) return "";
    const cleanOtp = String(otp).trim();
    const cleanOrderId = String(orderId || "").trim();
    return crypto
        .createHmac("sha256", OTP_SECRET)
        .update(`${cleanOtp}:${cleanOrderId}`)
        .digest("hex");
};

/**
 * Encrypt OTP using AES-256-GCM
 * Used so raw OTP is NEVER stored as plain text in MongoDB,
 * but can be securely decrypted ONLY for the authenticated customer who owns the order.
 * Returns formatted string "ivHex:authTagHex:encryptedHex"
 */
export const encryptDeliveryOtp = (otp) => {
    if (!otp) return null;
    const cleanOtp = String(otp).trim();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(cleanOtp, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypt AES-256-GCM encrypted OTP
 */
export const decryptDeliveryOtp = (encryptedData) => {
    if (!encryptedData || typeof encryptedData !== "string") return null;

    try {
        const parts = encryptedData.split(":");
        if (parts.length !== 3) return null;

        const [ivHex, authTagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        return null;
    }
};

/**
 * Constant-time verification of submitted OTP against stored hash
 */
export const verifyDeliveryOtpHash = (submittedOtp, storedHash, orderId = "") => {
    if (!submittedOtp || !storedHash) return false;

    try {
        const cleanSubmitted = String(submittedOtp).trim();
        const calculatedHash = hashDeliveryOtp(cleanSubmitted, orderId);

        const calculatedBuffer = Buffer.from(calculatedHash, "hex");
        const storedBuffer = Buffer.from(storedHash, "hex");

        if (calculatedBuffer.length !== storedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(calculatedBuffer, storedBuffer);
    } catch (err) {
        return false;
    }
};
