const express = require("express");
const router = express.Router();
const { getGoogleSheet } = require("../services/googleSheetsService");

// GET /filter?month=5&account=Food Expense
router.get("/", async (req, res) => {
  try {
    const { month, account } = req.query;

    // If no filters, return account names from "Accounts" sheet
    if (!account) {
      const accountsSheet = await getGoogleSheet("Accounts");
      await accountsSheet.loadCells();

      const accounts = [];
      for (let row = 1; ; row++) {
        // A2 = row 1 (0-based)
        const cellValue = accountsSheet.getCell(row, 0).value; // Column A
        if (!cellValue) break; // stop at first empty cell
        accounts.push(cellValue.toString());
      }

      return res.status(200).json({ accounts });
    }

    // Otherwise, filter Journal sheet
    const sheet = await getGoogleSheet("Journal");
    await sheet.loadCells();

    const rows = [];
    const monthIndex = month ? parseInt(month) : null;

    for (let i = 1; i < sheet.rowCount; i++) {
      // skip header row
      const dateCell = sheet.getCell(i, 0).value;
      const accountCell = sheet.getCell(i, 1).value;
      let amountCell = sheet.getCell(i, 2).value;
      const notesCell = sheet.getCell(i, 3).value;

      if (!dateCell || !accountCell || !amountCell) continue;

      // Parse amount if it's string like "$ 500.00"
      if (typeof amountCell === "string") {
        amountCell = parseFloat(amountCell.replace(/[^0-9.-]+/g, ""));
      }

      // Convert Google Sheets date to JS Date if number, else parse string
      let jsDate;
      if (typeof dateCell === "number") {
        // Google Sheets stores dates as serial numbers (days since 1899-12-30)
        jsDate = new Date(Date.UTC(1899, 11, 30 + dateCell));
      } else {
        jsDate = new Date(dateCell);
      }

      const rowMonth = jsDate.getMonth() + 1;
      if (monthIndex && rowMonth !== monthIndex) continue;
      if (accountCell !== account) continue;

      // Format date as DD-MM-YYYY
      const day = String(jsDate.getDate()).padStart(2, "0");
      const monthStr = String(jsDate.getMonth() + 1).padStart(2, "0");
      const year = jsDate.getFullYear();
      const formattedDate = `${day}-${monthStr}-${year}`;

      rows.push({
        date: formattedDate,
        amount: amountCell,
        notes: notesCell || "",
      });
    }

    res.status(200).json({ rows });
  } catch (error) {
    console.error("Error fetching filtered data:", error);
    res.status(500).json({ message: "Failed to fetch filtered data." });
  }
});

module.exports = router;
