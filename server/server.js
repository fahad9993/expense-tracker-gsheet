const express = require("express");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const app = express();
const port = process.env.PORT || 3000;

// Google Sheets API setup
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_TITLE = process.env.SHEET_TITLE;
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

// Fetch initial quantities from Google Sheets
app.get("/fetchQuantities", async (req, res) => {
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
app.post("/updateQuantities", express.json(), async (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
