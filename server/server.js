require("dotenv").config();

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const authenticateToken = require("./middlewares/authenticateToken");

// Built-in middleware to parse JSON bodies
app.use(express.json());

// Routers
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const homeRouter = require("./routes/home");
const journalRouter = require("./routes/journal");

// Public routes (no authentication needed)
app.use("/auth", authRouter);

// Protected routes (authentication required)
app.use("/dashboard", authenticateToken, dashboardRouter);
app.use("/home", authenticateToken, homeRouter);
app.use("/journal", authenticateToken, journalRouter);

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
