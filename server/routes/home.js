const express = require("express");
const router = express.Router();
const { getGoogleSheet } = require("../services/googleSheetsService");

// Fetch initial quantities from Google Sheets
router.get("/fetch", async (req, res) => {
  try {
    const sheet = await getGoogleSheet(process.env.SHEET_TITLE);
    const rows = await sheet.getRows();

    // Map rows to quantities (assuming column 'Qty' contains quantities)
    const bankNotes = rows.map((row) => parseInt(row._rawData[0]) || "0", 10);
    const quantities = rows.map((row) => parseInt(row._rawData[1] || "0", 10));

    res.status(200).json({ bankNotes, quantities });
  } catch (error) {
    console.error("Error fetching quantities:", error);
    res.status(500).json({ error: "Error fetching data from Google Sheets." });
  }
});

// Update quantities in Google Sheets (assuming there's a 'Qty' column)
router.post("/update", async (req, res) => {
  try {
    const { quantities } = req.body; // An array of quantities
    if (!Array.isArray(quantities)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const sheet = await getGoogleSheet(process.env.SHEET_TITLE);
    const rows = await sheet.getRows();

    // Update rows based on the quantities
    rows.forEach(async (row, index) => {
      row._rawData[1] = quantities[index] || 0;
      await row.save(); // Ensure the save operation completes
    });

    res.status(200).json({ message: "Quantities updated successfully." });
  } catch (error) {
    console.error("Error updating quantities:", error);
    res.status(500).json({ error: "Error updating data in Google Sheets." });
  }
});

module.exports = router;
