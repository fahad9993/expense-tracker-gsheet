require("dotenv").config();

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

      const jwt = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: SCOPES,
      });

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle["Journal"];
      await sheet.loadHeaderRow(3);
      const rows = await sheet.getRows();

      // Helper to format the sheet date
      const formatSheetDate = (sheetDate) => {
        const d = new Date(sheetDate);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      };

      const targetDate = date.trim();
      const targetAccount = account.trim().toLowerCase();

      // Try to find an existing row
      const existingRow = rows.find((row) => {
        const rowDate = formatSheetDate(row.get("Date"));
        const rowAccount = row.get("Account")?.toString().trim().toLowerCase();
        return rowDate === targetDate && rowAccount === targetAccount;
      });

      if (existingRow) {
        // Update existing row
        existingRow.set("Amount", amount);
        existingRow.set("Notes", note);
        await existingRow.save();
        return res.status(200).send("Journal entry updated successfully");
      } else {
        // Add new row if not found
        await sheet.addRow({
          Date: date,
          Account: account,
          Amount: amount,
          Notes: note,
        });
        return res.status(200).send("Journal entry added successfully");
      }
    } catch (error) {
      console.error("Error appending or updating journal entry:", error);
      return res.status(500).send("Failed to append or update journal entry");
    }
  }
);

app.get("/getJournalEntry", authenticateToken, async (req, res) => {
  const { date, account } = req.query;

  const formatSheetDate = (sheetDate) => {
    const d = new Date(sheetDate);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  if (!date || !account) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const jwt = new JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle["Journal"];
    await sheet.loadHeaderRow(3);
    const rows = await sheet.getRows();

    const targetDate = date.trim();
    const targetAccount = account.trim().toLowerCase();

    const matchingRow = rows.find((row) => {
      const rowDateRaw = row.get("Date");
      const rowDate = formatSheetDate(rowDateRaw);
      const rowAccount = row.get("Account")?.toString().trim().toLowerCase();

      return rowDate === targetDate && rowAccount === targetAccount;
    });

    if (!matchingRow) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await sheet.loadCells(
      `C${matchingRow.rowNumber}:C${matchingRow.rowNumber}`
    );
    const amountCell = sheet.getCellByA1(`C${matchingRow.rowNumber}`);
    const amountFormula = amountCell.formula;

    if (matchingRow) {
      return res.status(200).json({
        Notes: matchingRow.get("Notes") || "",
        Amount: amountFormula ? amountFormula : matchingRow.get("Amount") || "",
      });
    } else {
      return res.status(404).json({ message: "Entry not found" });
    }
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return res.status(500).json({ error: "Failed to fetch journal entry" });
  }
});

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

app.get("/getSuggestions", authenticateToken, async (req, res) => {
  try {
    const jwtClient = new JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwtClient);
    await doc.loadInfo();

    const accountSheet = doc.sheetsByTitle["Accounts"]; // Sheet named "Accounts"
    const rows = await accountSheet.getRows(); // rows[0] = A2, rows[1] = A3, etc.

    // Get column A values from rows (starting from A2)
    const accountNames = rows
      .map((row) => row._rawData[0]) // Get column A
      .filter((name) => !!name); // Remove empty cells

    const foodNames = rows
      .map((row) => row._rawData[2]) // Get column C
      .filter((name) => !!name);

    const OtherItems = rows
      .map((row) => row._rawData[3]) // Get column D
      .filter((name) => !!name);

    res.json({
      accounts: accountNames,
      foodNames: foodNames,
      otherItems: OtherItems,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).send("Failed to fetch account list");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
