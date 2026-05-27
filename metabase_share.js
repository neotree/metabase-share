function syncMetabaseCardToSheet(cardId, destinationSheetName) {
  const props = PropertiesService.getScriptProperties();

  const METABASE_URL = props.getProperty("METABASE_URL");
  const METABASE_API_KEY = props.getProperty("METABASE_API_KEY");
   const METABASE_CARD_ID = props.getProperty("METABASE_CARD_ID");

  const response = UrlFetchApp.fetch(
    `${METABASE_URL}api/card/${METABASE_CARD_ID}/query/json`,
    {
      method: "post",
      headers: {
        "x-api-key": METABASE_API_KEY
      },
      muteHttpExceptions: true
    }
  );

  console.log(`${METABASE_URL}api/card/${METABASE_CARD_ID}/query/json`)

  const status = response.getResponseCode();

  if (status < 200 || status >= 300) {
    throw new Error(
      `Metabase request failed for card ${METABASE_CARD_ID}: ${status} - ${response.getContentText()}`
    );
  }

  const rows = JSON.parse(response.getContentText());

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    spreadsheet.getSheetByName(destinationSheetName) ||
    spreadsheet.insertSheet(destinationSheetName);

  sheet.clearContents();

  if (!Array.isArray(rows) || rows.length === 0) {
    sheet.getRange(1, 1).setValue("No data returned");
    sheet.getRange(1, 2).setValue("Last synced");
    sheet.getRange(1, 3).setValue(new Date());
    return;
  }

  const headers = Object.keys(rows[0]);
  const values = rows.map(row => headers.map(header => row[header]));

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);

  sheet.getRange(1, headers.length + 2).setValue("Last synced");
  sheet.getRange(2, headers.length + 2).setValue(new Date());
}