import app from "./config/firebaseAdmin.js";
import { adminAuth } from "./config/firebaseAdmin.js";

try {

    console.log("Firebase Admin Connected ✅");
    console.log(app ? app.name : "App not initialized (no service account configured)");
    console.log(typeof adminAuth);

} catch (err) {

    console.log(err);

}