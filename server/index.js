// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use PORT from environment (Railway/Heroku/Vercel) or default to 5000
const PORT = process.env.PORT || 5000;

// Google Sheets auth
const auth = new google.auth.GoogleAuth({
  // You can override the filename via .env (e.g. GOOGLE_CREDENTIALS_FILE=credentials.json)
  keyFile: path.join(__dirname, process.env.GOOGLE_CREDENTIALS_FILE || "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post("/submit", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.SHEET_ID; // set this in your .env
    const data = req.body;

    const values = [[
      data.firstName,
      data.lastName,
      data.email,
      data.city,
      data.phone,
      data.altPhone,
      data.address,
      data.zipcode,
      data.accountHolder,
      data.accountNumber,
      data.ifsc,
      data.bankName,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    res.status(200).send("Data saved to Google Sheet!");
  } catch (err) {
    console.error("Google Sheets error", err);
    res.status(500).send("Failed to submit");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
