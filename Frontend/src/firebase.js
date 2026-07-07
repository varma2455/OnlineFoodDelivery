import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM",

    authDomain: "foodexpress-cc86b.firebaseapp.com",

    projectId: "foodexpress-cc86b",

    storageBucket: "foodexpress-cc86b.firebasestorage.app",

    messagingSenderId: "192471303769",

    appId: "1:192471303769:web:5039d8de6cb90a9bb91348",

    measurementId: "G-X39YBYYDBB"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
