# Google Apps Script — Lead Sheet Webhook

Deploy this script to append contact form submissions to a Google Sheet.

## Setup

1. Create a Google Sheet named **BLS Website Leads**
2. Add headers in row 1: `Timestamp | Name | Email | Company | Phone | Message | Source | Status`
3. Open **Extensions → Apps Script**
4. Paste the code below and save
5. Deploy → **New deployment** → Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the web app URL → set as `GOOGLE_SHEET_WEBHOOK_URL` in Vercel
7. Set the same secret in `CONTACT_WEBHOOK_SECRET` (Vercel) and in the script below

## Script

```javascript
const SECRET = "your-random-secret-here"; // match CONTACT_WEBHOOK_SECRET
const SHEET_NAME = "BLS Website Leads";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.secret !== SECRET) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Unauthorized" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.company || "",
      data.phone || "",
      data.message || "",
      data.source || "contact",
      data.status || "New",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```
