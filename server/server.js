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
const filterRouter = require("./routes/filter");

// Public routes (no authentication needed)
app.use("/auth", authRouter);

// Protected routes (authentication required)
app.use("/dashboard", authenticateToken, dashboardRouter);
app.use("/home", authenticateToken, homeRouter);
app.use("/journal", authenticateToken, journalRouter);
app.use("/filter", authenticateToken, filterRouter);

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
