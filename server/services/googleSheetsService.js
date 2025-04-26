const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

let jwtClient;
let doc;
let isInitializing = false;

const initializeGoogleSheets = async () => {
  if (doc || isInitializing) {
    return;
  }

  isInitializing = true;

  try {
    if (!jwtClient) {
      jwtClient = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: SCOPES,
      });
    }

    if (!doc) {
      doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, jwtClient);
      await doc.loadInfo();
    }
  } finally {
    isInitializing = false; // Always unlock, even if error happens
  }
};

const getGoogleSheet = async (sheetTitle) => {
  await initializeGoogleSheets();
  const sheet = doc?.sheetsByTitle?.[sheetTitle];
  if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found.`);
  return sheet;
};

module.exports = {
  getGoogleSheet,
};
