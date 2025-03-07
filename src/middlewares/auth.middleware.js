const { admin } = require("../config/firebase"); // Import Firebase Admin

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach the user's data to the request object
    req.user = decodedToken;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

module.exports = authenticateUser;
