const admin = require("firebase-admin");

// Load Firebase Admin credentials
const serviceAccount = require("../../fabtrack-firebase.json"); //firebase admin sdk import

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

// Initialize Firebase App
// const firebaseApp = firebase.initializeApp(firebaseConfig);

module.exports = admin;
