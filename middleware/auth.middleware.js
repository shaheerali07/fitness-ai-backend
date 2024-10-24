require("dotenv").config();
const jwt = require("jsonwebtoken");
// Middleware to protect routes
exports.authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the header

  if (token) {
    // Verify the token using the same secret
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token, forbidden access
      }
      req.user = user; // Attach user info to request object
      next(); // Proceed to the next middleware/route
    });
  } else {
    res.sendStatus(401); // Unauthorized access (no token)
  }
};
