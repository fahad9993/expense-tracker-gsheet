const express = require("express");
const router = express.Router();
const { getGoogleSheet } = require("../services/googleSheetsService");
const { formatSheetDate } = require("../utils/formatDate");

router.post("/append", async (req, res) => {
  try {
    const { date, account, amount, note } = req.body;

    if (!date || !account || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const sheet = await getGoogleSheet("Journal");
    await sheet.loadHeaderRow(3);
    const rows = await sheet.getRows();

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
      return res
        .status(200)
        .json({ message: "Journal entry updated successfully." });
    } else {
      // Add new row if not found
      await sheet.addRow({
        Date: date,
        Account: account,
        Amount: amount,
        Notes: note,
      });
      return res
        .status(201)
        .json({ message: "Journal entry added successfully." });
    }
  } catch (error) {
    console.error("Error appending or updating journal entry:", error);
    return res
      .status(500)
      .json({ message: "Failed to append or update journal entry." });
  }
});

router.get("/fetch", async (req, res) => {
  const { date, account } = req.query;

  if (!date || !account) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters." });
  }

  try {
    const sheet = await getGoogleSheet("Journal");
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
      return res.status(404).json({ message: "Entry not found." });
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
      return res.status(404).json({ message: "Entry not found." });
    }
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return res.status(500).json({ message: "Failed to fetch journal entry." });
  }
});

router.get("/getSuggestions", async (req, res) => {
  try {
    const accountSheet = await getGoogleSheet("Accounts"); // Sheet named "Accounts"
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

    res.status(200).json({
      accounts: accountNames,
      foodNames: foodNames,
      otherItems: OtherItems,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Failed to fetch account list." });
  }
});

module.exports = router;
