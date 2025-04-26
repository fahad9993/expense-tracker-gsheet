const express = require("express");
const router = express.Router();
const { getGoogleSheet } = require("../services/googleSheetsService");

router.get("/fetch", async (req, res) => {
  try {
    // Access the "Net Income" sheet
    const accountSheet = await getGoogleSheet("Net Income");

    // Load all cells
    await accountSheet.loadCells();

    // Get values from column P (index 15) for rows 2 to 5
    const amounts = [];
    for (let i = 1; i <= 4; i++) {
      const cell = accountSheet.getCell(i, 15); // Row i, Column 15 (P)
      amounts.push(cell.value);
    }

    const variance = accountSheet.getCell(18, 10).value;

    const reportSheet = await getGoogleSheet("Reports of Accounts");
    await reportSheet.loadCells();

    const pieLabels = [];
    const pieValues = [];
    const pieValuesCurrentMonth = [];

    const currentMonth = new Date().getMonth();

    for (let i = 17; i <= 29; i++) {
      // B18:B30 and O18:O30
      const label = reportSheet.getCell(i, 1).value; // B column (1-based index)
      const value = reportSheet.getCell(i, 14).value; // O column (1-based index)
      const valueMonth = reportSheet.getCell(i, currentMonth + 2).value;
      if (label && value !== null && valueMonth !== null) {
        pieLabels.push(label);
        pieValues.push(value);
        pieValuesCurrentMonth.push(valueMonth);
      }
    }

    res.json({
      amounts,
      variance,
      pieChart: {
        labels: pieLabels,
        values: pieValues,
        currentValues: pieValuesCurrentMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard info:", error);
    res.status(500).send("Failed to fetch account data.");
  }
});

router.post("/update", async (req, res) => {
  try {
    const { amounts } = req.body;

    if (!Array.isArray(amounts) || amounts.length !== 4) {
      return res.status(400).send("Invalid or missing amounts");
    }

    const accountSheet = await getGoogleSheet("Net Income");
    await accountSheet.loadCells();

    for (let i = 1; i <= 3; i++) {
      const cell = accountSheet.getCell(i, 15); // Row i, Column P (index 15)
      cell.value = amounts[i - 1];
    }

    await accountSheet.saveUpdatedCells();

    res.json({ message: "Dashboard updated successfully." });
  } catch (error) {
    console.error("Error updating dashboard info:", error);
    res.status(500).send("Failed to update dashboard info.");
  }
});

module.exports = router;
