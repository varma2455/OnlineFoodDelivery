import crypto from "crypto";

/**
 * Generate a cryptographically secure random invitation token and its SHA-256 hash.
 * Only the raw token is returned to the client in the URL; only the hash is persisted in the database.
 */
export function generateInvitationToken() {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    return { rawToken, tokenHash };
}

/**
 * Hash a raw token with SHA-256
 */
export function hashToken(rawToken) {
    if (!rawToken || typeof rawToken !== "string") return "";
    return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

/**
 * Build the front-end activation URL
 */
export function getInvitationUrl(rawToken) {
    const clientBase = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    return `${clientBase}/restaurant/activate/${rawToken}`;
}

/**
 * Generate a formatted Application ID like RP-1024 or RP-749182
 */
export function generateApplicationId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RP-${randomNum}`;
}
