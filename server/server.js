//require("dotenv").config({ path: "../.env.local" });

const express = require("express");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

const validUsername = process.env.VALID_USERNAME;
const validPassword = process.env.VALID_PASSWORD;

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).send("Access Denied: No token provided");
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    // Use the environment variable
    if (err) {
      return res.status(403).send("Access Denied: Invalid token");
    }
    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

// Google Sheets API setup
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_TITLE = process.env.SHEET_TITLE;
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

app.post("/login", express.json(), (req, res) => {
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

// Fetch initial quantities from Google Sheets
app.get("/fetchQuantities", authenticateToken, async (req, res) => {
  try {
    // Authenticate with Google Sheets API using the service account
    const jwt = new JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE];
    const rows = await sheet.getRows();

    // Map rows to quantities (assuming column 'Qty' contains quantities)
    const bankNotes = rows.map((row) => parseInt(row._rawData[0]) || "0", 10);
    const quantities = rows.map((row) => parseInt(row._rawData[1] || "0", 10));

    res.json({ bankNotes, quantities });
  } catch (error) {
    console.error("Error fetching quantities:", error);
    res.status(500).send("Error fetching data from Google Sheets");
  }
});

// Update quantities in Google Sheets (assuming there's a 'Qty' column)
app.post(
  "/updateQuantities",
  authenticateToken,
  express.json(),
  async (req, res) => {
    try {
      const { quantities } = req.body; // An array of quantities
      if (!Array.isArray(quantities)) {
        return res.status(400).send("Invalid data format");
      }

      // Authenticate and access Google Sheets
      const jwt = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: SCOPES,
      });

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);

      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[SHEET_TITLE];
      const rows = await sheet.getRows();

      // Update rows based on the quantities
      rows.forEach(async (row, index) => {
        row._rawData[1] = quantities[index] || 0;
        await row.save(); // Ensure the save operation completes
      });

      res.status(200).send("Quantities updated successfully");
    } catch (error) {
      console.error("Error updating quantities:", error);
      res.status(500).send("Error updating data in Google Sheets");
    }
  }
);

app.post(
  "/appendJournalEntry",
  authenticateToken,
  express.json(),
  async (req, res) => {
    try {
      const { date, account, amount, note } = req.body;

      if (!date || !account || !amount) {
        return res.status(400).send("Missing required fields");
      }

      // Authenticate
      const jwt = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: SCOPES,
      });

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);

      await doc.loadInfo();

      const sheet = doc.sheetsByTitle["Journal"]; // Make sure sheet exists

      await sheet.addRow({
        A: date,
        B: account,
        C: amount,
        D: note,
      });

      res.status(200).send("Journal entry added successfully");
    } catch (error) {
      console.error("Error appending journal entry:", error);
      res.status(500).send("Failed to append journal entry");
    }
  }
);

app.post("/refreshToken", express.json(), (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("No refresh token provided");
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
