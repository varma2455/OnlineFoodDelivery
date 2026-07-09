import app from "./config/firebaseAdmin.js";
import { adminAuth } from "./config/firebaseAdmin.js";

try {

    console.log("Firebase Admin Connected ✅");

    console.log(app.name);

    console.log(typeof adminAuth);

} catch (err) {

    console.log(err);

}