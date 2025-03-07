const admin = require("firebase-admin");
require('dotenv').config(); 

// Load Firebase Admin credentials
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT//require("../../fabtrack-firebase.json"); //firebase admin sdk import

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

// Initialize Firebase App
// const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = admin;
