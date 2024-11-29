require("dotenv").config();
const jwt = require("jsonwebtoken");
// Middleware to protect routes
exports.authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the header
  const userSchema = require("../model/users");

  if (token) {
    // Verify the token using the same secret
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token, forbidden access
      }
      //find user from db and attach full user object to req.user
      const userFound = await userSchema.findById(user.id);
      if (!userFound) {
        return res.sendStatus(403); // Invalid token, forbidden access
      }
      req.user = userFound;
      next(); // Proceed to the next middleware/route
    });
  } else {
    res.sendStatus(401); // Unauthorized access (no token)
  }
};
