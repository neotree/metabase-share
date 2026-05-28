# Secure Google Sheets Sync from Metabase

## 1. What this setup does

This setup allows a Google Sheet to pull data from a private Metabase question/card without making the Metabase link public.

Instead of sharing a public Metabase link, the Google Sheet uses a small Google Apps Script to connect to Metabase securely using an API key.

The API key and Metabase details are stored in the script settings, not inside the sheet cells.

## 2. Why we are using this approach

We want clinicians to receive quality assurance logs in Google Sheets, but we do not want the Metabase questions or dashboards to be public.

This setup helps us:

- Keep Metabase links private.
- Avoid exposing the API key inside the Google Sheet.
- Use one reusable script function for each site.
- Give each site its own Google Sheet.
- Pull only the approved Metabase question/card into that sheet.

## 3. How the flow works

```text
Private Metabase question/card
        ↓
Metabase API key
        ↓
Google Apps Script
        ↓
Google Sheet used by clinicians
```

Each site has its own Google Sheet. Each sheet has the same script, but the value of `METABASE_CARD_ID` is different for each site.

For example:

```text
Site A Google Sheet → METABASE_CARD_ID = 101
Site B Google Sheet → METABASE_CARD_ID = 102
Site C Google Sheet → METABASE_CARD_ID = 103
Site D Google Sheet → METABASE_CARD_ID = 104
```

## 4. Important security notes

Please follow these rules:

- Do not make the Metabase question public.
- Do not paste the API key into a Google Sheet cell.
- Do not put the API key in a hidden tab.
- Do not share the API key by email or chat unless absolutely necessary.
- Do not use a Metabase admin account for this integration.
- Use a dedicated read-only Metabase API key.
- Give the API key access only to the approved question/card.
- Share the Google Sheet only with the correct people.
- Clinicians should normally be given Viewer or Commenter access, not Editor access.

## 5. What is needed before setup

Before setting up the Google Sheet, you need the following details:

| Item | Example | Description |
|---|---|---|
| `METABASE_URL` | `https://metabase.example.org` | The main Metabase website address |
| `METABASE_API_KEY` | `mb_xxxxxxxxxxxxx` | The API key used to connect to Metabase |
| `METABASE_CARD_ID` | `101` | The Metabase question/card ID for this specific site |
| Destination sheet/tab name | `QA Logs` | The tab in Google Sheets where data will be written |

## 6. How to find the Metabase card ID

Open the Metabase question/card in your browser.

The URL normally looks something like this:

```text
https://metabase.example.org/question/101-site-a-quality-assurance-logs
```

In this example, the card ID is:

```text
101
```

That number is the value to use for:

```text
METABASE_CARD_ID
```

## 7. Google Sheet setup steps

### Step 1: Create or open the site Google Sheet

Create a Google Sheet for the site, for example:

```text
Site A QA Logs
```

Inside the sheet, create a tab called:

```text
QA Logs
```

The script can also create this tab automatically if it does not already exist.

### Step 2: Open Apps Script

In the Google Sheet, go to:

```text
Extensions → Apps Script
```

This will open the Apps Script editor.

### Step 3: Paste the script code

Paste the Apps Script code into the editor.

The script should contain a function like this:

```javascript
function syncQualityLogs() {
  const props = PropertiesService.getScriptProperties();
  const cardId = props.getProperty("METABASE_CARD_ID");

  syncMetabaseCardToSheet(cardId, "QA Logs");
}
```

The function above reads the Metabase card ID from the script settings.

### Step 4: Save the script

Click the save icon, or press:

```text
Ctrl + S
```

Give the project a clear name, for example:

```text
Site A QA Logs Sync
```

## 8. How to set up the script properties

Script properties are where we store the private setup values.

### Step 1: Open Project Settings

In the Apps Script editor, click:

```text
Project Settings
```

This is usually the gear icon on the left side.

### Step 2: Find Script Properties

Scroll down to:

```text
Script Properties
```

Click:

```text
Add script property
```

### Step 3: Add the required properties

Add the following properties one by one.

#### Property 1

```text
Name:  METABASE_URL
Value: https://metabase.example.org
```

Replace the example URL with the real Metabase URL.

#### Property 2

```text
Name:  METABASE_API_KEY
Value: mb_xxxxxxxxxxxxxxxxxxxxx
```

Replace the example value with the real Metabase API key.

#### Property 3

```text
Name:  METABASE_CARD_ID
Value: 101
```

Replace `101` with the Metabase card ID for that site.

For another site, use that site's own card ID.

Example:

```text
Site A → METABASE_CARD_ID = 101
Site B → METABASE_CARD_ID = 102
Site C → METABASE_CARD_ID = 103
Site D → METABASE_CARD_ID = 104
```
##### Property 4
```text
name: SHEET_NAME
value: CPH Unmatched Log
```
## 9. How to run the sync manually

In the Apps Script editor:

1. Select the function:

```text
syncQualityLogs
```

2. Click:

```text
Run
```

The first time you run it, Google will ask for permission.

Approve the permissions using the Google account that owns or manages the sheet.

After the script runs successfully, the `QA Logs` tab should be updated with data from Metabase.

## 10. How to set automatic refresh using triggers

You can make the sheet refresh automatically using a trigger.

A trigger is like a timer. It tells Google Sheets to run the sync function at selected times without someone clicking the `Run` button manually.

### Option A: Create a trigger manually

In the Apps Script editor:

1. Click the clock icon on the left side. This is called `Triggers`.
2. Click `Add Trigger`.
3. Choose the function:

```text
syncQualityLogs
```

4. Choose the event source:

```text
Time-driven
```

5. Choose the type of time-based trigger, for example:

```text
Day timer
```

6. Choose a suitable time, for example:

```text
6am to 7am
```

7. Save the trigger.

The sheet will now refresh automatically.

### Example: Run twice per day

To refresh the sheet twice a day, create two separate triggers for the same function.

Create the first trigger like this:

```text
Function: syncQualityLogs
Event source: Time-driven
Type: Day timer
Time: 6am to 7am
```

Create the second trigger like this:

```text
Function: syncQualityLogs
Event source: Time-driven
Type: Day timer
Time: 6pm to 7pm
```

This means the sheet will refresh once in the morning and once in the evening.

Google may not run the trigger at the exact minute. For example, if you select `6am to 7am`, Google will run it sometime within that hour.
```

To use this:

1. Paste the function into Apps Script.
2. Save the script.
3. Select the function:

```text
createTwiceDailyTriggers
```

4. Click `Run`.
5. Approve permissions if Google asks.

After this, Google will automatically run `syncQualityLogs` twice per day.

Only run `createTwiceDailyTriggers` when setting up or changing the schedule. You do not need to run it every day.



## 11. Summary

This setup allows us to safely send approved Metabase quality assurance logs into Google Sheets without making the Metabase link public.

Each site has its own Google Sheet, and each sheet uses the same script. The only site-specific value is usually the `METABASE_CARD_ID`.

The most important security point is this:

```text
The API key must stay in Script Properties, not inside the Google Sheet.
```
