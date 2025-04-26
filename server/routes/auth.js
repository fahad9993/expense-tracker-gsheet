const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const validUsername = process.env.VALID_USERNAME;
const validPassword = process.env.VALID_PASSWORD;

router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;

  if (username === validUsername && password === validPassword) {
    // Access Token (short-lived)
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_SECRET_KEY,
      {
        expiresIn: "7d", // Valid for 7 days
      }
    );

    return res.json({ token, refreshToken }); // Send both tokens
  } else {
    return res.status(401).send("Invalid credentials");
  }
});

router.post("/refreshToken", express.json(), (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("No refresh token provided.");
  }

  // Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send("Invalid refresh token");

    // Generate new access token
    const newAccessToken = jwt.sign(
      { username: user.username },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token: newAccessToken });
  });
});

module.exports = router;
