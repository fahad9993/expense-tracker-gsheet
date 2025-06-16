const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    // Use the environment variable
    if (err) {
      return res.status(403).json({ message: "Access Denied: Invalid token" });
    }
    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
